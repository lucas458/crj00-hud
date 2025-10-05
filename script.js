Math.clamp = (value, min, max) => {
    if (value < min) return min;
    if (value > max) return max;
    return value;
};

function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

var airplane = {

    speed: 0,
    altitude: 0,

    orientation: {
        pitch: 0,
        roll: 0,
        yaw: 0
    },
    
    autopilot: {
        speed: 0,
        altitude: 0,
        heading: 0
    },

};


function setPitch( value = 0 ){
    value = Math.clamp(value, -90, 90);
    airplane.orientation.pitch = value;
    const pos = map(value, -90, 90, -1856, 1856);
    atitude.style.transform = `rotate(${airplane.orientation.roll}deg) translateY(${pos}px)`;
}


function setRoll( value = 0 ){
    value = Math.clamp(value, 0, 360);
    airplane.orientation.roll = value;
    const isInvertedFlight = value > 90 && value < 270;
    const pos = map(airplane.orientation.pitch, -90, 90, -1856, 1856);
    atitude.style.transform = `rotate(${airplane.orientation.roll}deg) translateY(${pos}px)`;


    let angle = -((value > 180)? value - 360 : value);
    angle = Math.clamp(angle, -38, 38);

    roll_indicator.style.transform = `rotate(${ angle }deg)`;
    atitude_numbers.style.backgroundImage = isInvertedFlight ? "url('assets/hud_atitude_number_flip.png')" : "";

}


function setYaw( value = 0 ){
    value = Math.clamp(value, 0, 360); 
    airplane.orientation.yaw = value;
    compass.style.transform = `rotate(${360 - value}deg)`;

    let compass_horizontal;

    if ( value >= 180 ){
        compass_horizontal = -map(value, 0, 180, -8232 + 206*22, 0) - 206;
    }else{
        compass_horizontal = map(360 - value, 0, 360, -8232 + 206*4, 0) - 3910;
    }

    compass_horizontal -= 3;

    hud_compass_horizontal_strip.style.left = compass_horizontal + 'px';

    setAutopilotHeading(airplane.autopilot.heading);
}




function setAutopilotHeading( value ){
    airplane.autopilot.heading = Math.clamp(value, 0, 360);
    hud_compass_ap.style.transform = `rotate(${airplane.autopilot.heading - airplane.orientation.yaw}deg)`;
}





function setAutopilotSpeed( value = 0 ){
    airplane.autopilot.speed = Math.clamp(value, 0, 340);
    let y = 141 - (airplane.autopilot.speed - airplane.speed)*26/10;
    y = Math.clamp(y, 42, 252);
    hud_speed_ap.style.top = y + 'px';
}

function setSpeed( value = 0 ){
    value = Math.clamp(value, 0, 340);
    airplane.speed = value;
    const pos = map(airplane.speed, 0, 340, 210, 1979);
    speed_strip.style.top = `calc( -894px + ${pos}px / 2)`;
    setAutopilotSpeed(airplane.autopilot.speed);
}






function setAltitude( value = 0 ){
    // airplane.altitude = Math.clamp(value, -900, 50000);
    airplane.altitude = Math.clamp(value, -900, 99000);

    if ( airplane.altitude < 0 ){
        const pos = map(airplane.altitude, -900, 0, 292, 1192);
        altitude_strip.style.top = `calc( -1947px + ${pos}px / 2)`;
        return;
    }

    const altitudeHundreds = airplane.altitude % 1000;
    const altitudeThousands = parseInt(airplane.altitude / 1000);
    let offset = 0;
    let offset2 = 0;

    if ( altitudeHundreds >= 900 && altitudeHundreds <= 999 ){
        offset = map(altitudeHundreds, 900, 999, 0, 22);
    }
    
    if ( airplane.altitude % 10000 >= 9900 && airplane.altitude % 10000 <= 9999 ){
        offset2 = map(airplane.altitude % 10000, 9900, 9999, 0, 22);
    }
    
    // LEFT BIG DIGIT
    altitude_indicator.children[0].style.visibility = ( altitudeThousands < 10 )? 'hidden' : 'visible'; 
    altitude_indicator.children[0].firstElementChild.style.top = ((-220 - ((altitudeThousands/10|0) * -22 - offset2)) ) + 'px';

    // RIGHT BIG DIGIT
    altitude_indicator.children[1].firstElementChild.style.top = ((-220 - ((altitudeThousands%10) * -22 - offset)) ) + 'px';
    
    if ( airplane.altitude <= 1000 ){
        const pos = map(airplane.altitude, 0, 1000, 1192, 2192);
        altitude_strip.style.top = `calc( -1947px + ${pos}px / 2)`;
        return;
    }
    
    altitude_strip.style.top = `calc( -1947px + ${altitudeHundreds + 2192}px / 2)`;

}








const controller = {

    // ROLL
    ArrowLeft: {
        press: false,
        call: () => {
            airplane.orientation.roll = (airplane.orientation.roll + 2) % 360;
            setRoll(airplane.orientation.roll);
        }
    },
    ArrowRight: {
        press: false,
        call: () => {
            if ( airplane.orientation.roll > 0 ){
                airplane.orientation.roll -= 2;
            }else{
                airplane.orientation.roll = 360;
            }
            setRoll(airplane.orientation.roll);
        }
    },

    // PITCH
    ArrowUp: {
        press: false,
        call: () => { setPitch(airplane.orientation.pitch - (0.4 * Math.cos(airplane.orientation.roll*Math.PI/180) )); }
    },
    ArrowDown: {
        press: false,
        call: () => { setPitch(airplane.orientation.pitch + (0.4 * Math.cos(airplane.orientation.roll*Math.PI/180) )); }
    },

    // SPEED
    1: {
        press: false,
        call: () => { setSpeed(airplane.speed - 1); }
    },
    2: {
        press: false,
        call: () => { setSpeed(airplane.speed + 1); }
    },

    // ALTITUDE
    3: {
        press: false,
        call: () => { setAltitude(airplane.altitude - 10); }
    },
    4: {
        press: false,
        call: () => { setAltitude(airplane.altitude + 10); }
    },

    // SPEED AUTOPILOT
    5: {
        press: false,
        call: () => { setAutopilotSpeed(airplane.autopilot.speed - 1); }
    },
    6: {
        press: false,
        call: () => { setAutopilotSpeed(airplane.autopilot.speed + 1); }
    },
    
    // COMPASS AUTOPILOT
    7: {
        press: false,
        call: () => { setAutopilotHeading(airplane.autopilot.heading - 1); }
    },
    8: {
        press: false,
        call: () => { setAutopilotHeading(airplane.autopilot.heading + 1); }
    },


    // COMPASS
    q: {
        press: false,
        call: () => {
            if ( airplane.orientation.yaw > 0 ){
                airplane.orientation.yaw -= 1;
            }else{
                airplane.orientation.yaw = 360;
            }
            setYaw(airplane.orientation.yaw );
        }
    },
    e: {
        press: false,
        call: () => { setYaw((airplane.orientation.yaw + 1) % 360); }
    }

};







onkeydown = onkeyup = onblur = (event) => {
    if ( controller[event.key] != null ){
        controller[event.key].press = event.type == 'keydown';
    }
};

function update(){
    Object.keys(controller).forEach(key => {
        controller[key].press && controller[key].call();
    });
    requestAnimationFrame(update);
}


onload = () => {
    update();
    // cam();

    setSpeed(0);
    setAltitude(0);
    setPitch(0);
    setRoll(0);
    setYaw(0);

    setAutopilotSpeed(0);
    setAutopilotHeading(0);
    

};



// VIDEO
function cam(){
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    }).then(stream => {
        cameraPreview.srcObject = stream;
    })
}