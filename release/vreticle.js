var vreticle = { REVISION: '1' };

vreticle.Reticle = function(camera){

var new_reticle = {};
new_reticle.default_material=function(){
    return new THREE.MeshNormalMaterial();
}

new_reticle.get_random_hex_material=function(){
    return  new THREE.MeshBasicMaterial({color:new_reticle.util.get_random_hex_color(), transparent:true, opacity:0.5});
}
new_reticle.create_web_material = function(url_in){
    var new_texture = THREE.ImageUtils.loadTexture(url_in);
    new_texture.minFilter = THREE.NearestFilter
    new_texture.magFilter = THREE.LinearFilter;

    return new THREE.MeshBasicMaterial({map: new_texture});
};

new_reticle.create_default_object=function(position_in, face_camera, side_length, image_url_in, sphere){
    if (side_length == undefined){
        side_length = .2;
    }
    if (sphere == undefined){
        sphere=false;
    }
//action
if(image_url_in != undefined){
    var temp_material = new_reticle.create_web_material(image_url_in);
}else{
    temp_material = new_reticle.default_material();
}
if(sphere){
var default_geometry = new THREE.SphereGeometry( side_length, side_length, side_length );
}else{
var default_geometry = new THREE.BoxGeometry( side_length, side_length, side_length );
}
var default_object = new THREE.Mesh( default_geometry, temp_material );
default_object.position.x = position_in.x;
default_object.position.y =position_in.y;
default_object.position.z =position_in.z;
return default_object;

}

new_reticle.reticle_arm_object=null;
new_reticle.reticle_object=null;
new_reticle.init= function(camera){
    new_reticle.create_reticle(camera);
    new_reticle.start_clock();
}

new_reticle.create_reticle=function(camera){
    new_reticle.camera = camera;
    new_reticle.reticle_arm_object = new THREE.Object3D();
    new_reticle.reticle_object = new_reticle.create_default_object(new THREE.Vector3(0,0,-.5),true,.01,undefined,true);
    new_reticle.reticle_object.material.transparent = true;
    new_reticle.reticle_object.material.opacity = 0.5;
    new_reticle.reticle_arm_object.add(new_reticle.reticle_object);
    new_reticle.camera.add(new_reticle.reticle_arm_object);
}

new_reticle.get_reticle_position=function(){
    return new_reticle.reticle_object.position;
}

new_reticle.camera_ray=null

new_reticle.get_camera_ray=function(){
    return new_reticle.camera_ray.ray;

}

new_reticle.detect_reticle_hit=function(){
    //hack, these values should be calculated
    var vector = new THREE.Vector3(-0.0012499999999999734, -0.0053859964093356805, 0.5);
    vector.unproject(new_reticle.camera);
    var ray = new THREE.Raycaster(new_reticle.camera.position, vector.sub(new_reticle.camera.position).normalize());

    var intersects = ray.intersectObjects(new_reticle.colliders);
//if an object is hit

    if (intersects.length > 0) {
        //save the new hit object and time
        new_reticle.reticle_hit_object = intersects[0].object;
        new_reticle.reticle_hit_time = new_reticle.clock.getElapsedTime();
        //is the hit object gazeable
        if(new_reticle.reticle_hit_object.gazeable){
            new_reticle.reticle_object.material = new_reticle.get_random_hex_material();
    //check if there's a gazing object
    if(new_reticle.gazing_object != null){
        //if the gazing object is the same as the hit object: check to see if the elapsed time exceeds the hover duration
        if(new_reticle.gazing_object == new_reticle.reticle_hit_object){
            //if it does: trigger the click
            if(new_reticle.reticle_hit_time - new_reticle.gazing_time >= new_reticle.gazing_duration){

            new_reticle.stop_video();
            new_reticle.gazing_object.on_click();
            //reset gazing time
            new_reticle.gazing_time = new_reticle.reticle_hit_time;
        }
        }else{
        //if there is but it doesn't match the hit object: save the new hit object and time
        console.log("gaze out");
        new_reticle.gazing_object = new_reticle.reticle_hit_object;
        new_reticle.gazing_time = new_reticle.reticle_hit_time;
        }

    }else{
        //if there is not: save the time and object as gazing
        console.log("gaze over");
        new_reticle.gazing_object = new_reticle.reticle_hit_object;
        new_reticle.gazing_time = new_reticle.reticle_hit_time;
    }

}
    }else{
        if(new_reticle.gazing_object != null){
            console.log("gaze out");
        //clear gazing and hit object and times
        new_reticle.reticle_hit_object = null;
        new_reticle.reticle_hit_time = null;
        new_reticle.gazing_object = null;
        new_reticle.gazing_time = null;
        new_reticle.reticle_object.material = new_reticle.default_material();
    }
    }
}
new_reticle.gazing_duration=1;
new_reticle.reticle_hit_object=null;
new_reticle.reticle_hit_time=null;
new_reticle.gazing_object=null;
new_reticle.gazing_time=null;
new_reticle.clock=null;
new_reticle.expanded_node=null;
new_reticle.colliders = [];
new_reticle.detect_gaze=function(){

}

new_reticle.reticle_loop=function(){
    new_reticle.detect_reticle_hit();
    new_reticle.detect_gaze();
}

new_reticle.start_clock=function(){
    new_reticle.clock = new THREE.Clock(true);
}

//start the reticle
new_reticle.init(camera);
return new_reticle;
}