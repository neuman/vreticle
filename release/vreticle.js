var vreticle = {
    REVISION: '1'
};

vreticle.Reticle = function(camera) {

    var new_reticle = {};
    new_reticle.default_material = function() {
        return new THREE.MeshNormalMaterial();
    }
    new_reticle.get_random_hex_color = function() {
	    return '#'+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6);
        },

        new_reticle.get_random_hex_material = function() {
            return new THREE.MeshBasicMaterial({
                color: this.get_random_hex_color(),
                transparent: true,
                opacity: 0.5
            });
        }
    new_reticle.create_web_material = function(url_in) {
        var new_texture = THREE.ImageUtils.loadTexture(url_in);
        new_texture.minFilter = THREE.NearestFilter
        new_texture.magFilter = THREE.LinearFilter;

        return new THREE.MeshBasicMaterial({
            map: new_texture
        });
    };

    new_reticle.create_default_object = function(position_in, face_camera, side_length, image_url_in, sphere) {
        if (side_length == undefined) {
            side_length = .2;
        }
        if (sphere == undefined) {
            sphere = false;
        }
        //action
        if (image_url_in != undefined) {
            var temp_material = new_reticle.create_web_material(image_url_in);
        } else {
            temp_material = new_reticle.default_material();
        }
        if (sphere) {
            var default_geometry = new THREE.SphereGeometry(side_length, side_length, side_length);
        } else {
            var default_geometry = new THREE.BoxGeometry(side_length, side_length, side_length);
        }
        var default_object = new THREE.Mesh(default_geometry, temp_material);
        default_object.position.x = position_in.x;
        default_object.position.y = position_in.y;
        default_object.position.z = position_in.z;
        return default_object;

    }

    new_reticle.reticle_arm_object = null;
    new_reticle.reticle_object = null;
    new_reticle.gazing_duration = 1;
    new_reticle.reticle_hit_object = null;
    new_reticle.reticle_hit_time = null;
    new_reticle.gazing_object = null;
    new_reticle.gazing_time = null;
    new_reticle.clock = null;
    new_reticle.expanded_node = null;
    new_reticle.colliders = [];
    new_reticle.init = function(camera) {
        this.create_reticle(camera);
        this.start_clock();
    }

    new_reticle.create_reticle = function(camera) {
        this.camera = camera;
        this.reticle_arm_object = new THREE.Object3D();
        this.reticle_object = this.create_default_object(new THREE.Vector3(0, 0, -.5), true, .01, undefined, true);
        this.reticle_object.material.transparent = true;
        this.reticle_object.material.opacity = 0.5;
        this.reticle_arm_object.add(this.reticle_object);
        this.camera.add(this.reticle_arm_object);


        new_reticle.reticle_text_sprite = new_reticle.makeTextSprite(" World! ", {
            fontsize: 32,
            fontface: "Georgia",
            borderColor: {
                r: 0,
                g: 0,
                b: 255,
                a: 1.0
            }
        });


        this.reticle_text_sprite.position.setZ(-.5).setY(-.15).setX(.25);
    }

    new_reticle.show_text_sprite = function() {
        this.reticle_object.add(this.reticle_text_sprite);
    }

    new_reticle.show_text_sprite = function() {
        this.reticle_object.add(this.reticle_text_sprite);
    }

    new_reticle.hide_text_sprite = function() {
        this.reticle_object.remove(this.reticle_text_sprite);
    }

    new_reticle.get_reticle_position = function() {
        return new_reticle.reticle_object.position;
    }

    new_reticle.camera_ray = null

    new_reticle.get_camera_ray = function() {
        return new_reticle.camera_ray.ray;

    }

    new_reticle.detect_reticle_hit = function() {
        //hack, these values should be calculated
        var vector = new THREE.Vector3(-0.0012499999999999734, -0.0053859964093356805, 0.5);
        vector.unproject(this.camera);
        var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

        var intersects = ray.intersectObjects(this.colliders);
        //if an object is hit

        if (intersects.length > 0) {
            //save the new hit object and time
            this.reticle_hit_object = intersects[0].object;
            this.reticle_hit_time = this.clock.getElapsedTime();
            //is the hit object gazeable
            if (this.reticle_hit_object.gazeable) {
                this.reticle_object.material = this.get_random_hex_material();
                //check if there's a gazing object
                if (this.gazing_object != null) {
                    //if the gazing object is the same as the hit object: check to see if the elapsed time exceeds the hover duration
                    if (this.gazing_object == this.reticle_hit_object) {
                        //if it does: trigger the click
                        if (this.reticle_hit_time - this.gazing_time >= this.gazing_duration) {
                            if (this.gazing_object.ongazelong != undefined) {
                                this.gazing_object.ongazelong();
                            }
                            //reset gazing time
                            this.gazing_time = this.reticle_hit_time;
                        }
                    } else {
                        //if there is but it doesn't match the hit object: save the new hit object and time
                        console.log("gaze out");
                        this.gazing_object = this.reticle_hit_object;
                        this.gazing_time = this.reticle_hit_time;
                        if (this.gazing_object.ongazeout != undefined) {
                            this.gazing_object.ongazeout();
                        }
                    }

                } else {
                    //if there is not: save the time and object as gazing
                    console.log("gaze over");
                    this.gazing_object = this.reticle_hit_object;
                    this.gazing_time = this.reticle_hit_time;
                    if (this.gazing_object.ongazeover != undefined) {
                        this.gazing_object.ongazeover();
                    }
                }

            }
        } else {
            if (this.gazing_object != null) {
                console.log("gaze out");
                if (this.gazing_object.ongazeout != undefined) {
                    this.gazing_object.ongazeout();
                }
                //clear gazing and hit object and times
                this.reticle_hit_object = null;
                this.reticle_hit_time = null;
                this.gazing_object = null;
                this.gazing_time = null;
                this.reticle_object.material = this.default_material();
            }
        }
    }

    new_reticle.remove_from_list = function(object_in, list_in) {
        var index = list_in.indexOf(object_in);
        if (index > -1) {
            console.log("removing");
            list_in.splice(index, 1);
        }
    }

    new_reticle.add_collider = function(three_object) {
        three_object.gazeable = true;
        this.colliders.push(three_object);
    };

    new_reticle.remove_collider = function(three_object) {
        three_object.gazeable = false;
        this.remove_from_list(three_object, new_reticle.colliders);
    };

    new_reticle.detect_gaze = function() {

    };

    new_reticle.reticle_loop = function() {
        this.detect_reticle_hit();
        this.detect_gaze();
    }

    new_reticle.start_clock = function() {
        this.clock = new THREE.Clock(true);
    }

    new_reticle.makeTextSprite = function(message, parameters) {
        var get_sprite_text_material = function(message) {
            if (parameters === undefined) parameters = {};

            var fontface = parameters.hasOwnProperty("fontface") ?
                parameters["fontface"] : "Arial";

            var fontsize = parameters.hasOwnProperty("fontsize") ?
                parameters["fontsize"] : 18;

            var borderThickness = parameters.hasOwnProperty("borderThickness") ?
                parameters["borderThickness"] : 4;

            var borderColor = parameters.hasOwnProperty("borderColor") ?
                parameters["borderColor"] : {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 1.0
                };

            var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
                parameters["backgroundColor"] : {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 1.0
                };

            var spriteAlignment = 1;

            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            context.font = "Bold " + fontsize + "px " + fontface;

            // get size data (height depends only on font size)
            var metrics = context.measureText(message);
            var textWidth = metrics.width;

            // background color
            context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
            // border color
            context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

            context.lineWidth = borderThickness;
            new_reticle.roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
            // 1.4 is extra height factor for text below baseline: g,j,p,q.

            // text color
            context.fillStyle = "rgba(0, 0, 0, 1.0)";

            context.fillText(message, borderThickness, fontsize + borderThickness);

            // canvas contents will be used for a texture
            var texture = new THREE.Texture(canvas)
            texture.needsUpdate = true;

            var spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                useScreenCoordinates: false,
                alignment: spriteAlignment
            });

            return spriteMaterial;
        }

        var set_text = function(message) {
            this.material = this.get_sprite_text_material(message);
        }

        var blitz_text = function(message) {
            new_reticle.reticle_text_sprite.clear_blitz();
            new_reticle.show_text_sprite();
            new_reticle.reticle_text_sprite.tokenized_message = message.replace(/(<([^>]+)>)/ig, "").split(" ");


            new_reticle.reticle_text_sprite.counter = 1;
            new_reticle.reticle_text_sprite.myMethod = function() {
                if (new_reticle.reticle_text_sprite.tokenized_message[new_reticle.reticle_text_sprite.counter] != undefined) {
                    //new_sprite.position.set(55,105,55);
                    new_reticle.reticle_text_sprite.set_text(new_reticle.reticle_text_sprite.tokenized_message[new_reticle.reticle_text_sprite.counter]);
                    new_reticle.reticle_text_sprite.counter += 1;
                } else {
                    new_reticle.reticle_text_sprite.clear_blitz();
                }
            }

            //this.myMethod();
            new_reticle.reticle_text_sprite.refreshIntervalId = setInterval(new_reticle.reticle_text_sprite.myMethod, 100);
        }

        var clear_blitz = function() {
            clearInterval(new_reticle.reticle_text_sprite.refreshIntervalId);
            new_reticle.hide_text_sprite();
        }

        var sprite = new THREE.Sprite(get_sprite_text_material(message));
        sprite.scale.set(1, .5, 1.0);

        //prep sprite as refreshable
        sprite.style_parameters = parameters;
        sprite.get_sprite_text_material = get_sprite_text_material;
        sprite.set_text = set_text;
        sprite.blitz_text = blitz_text;
        sprite.clear_blitz = clear_blitz;
        //sprite.context = context;



        return sprite;
    }

    // function for drawing rounded rectangles
    new_reticle.roundRect = function(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }


    //start the reticle
    new_reticle.init(camera);
    return new_reticle;
}
