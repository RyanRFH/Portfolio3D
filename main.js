import * as THREE from 'three'
import WebGL from 'three/addons/capabilities/WebGL.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { handleCameraRotation, handleMouseMovement } from './CameraWithMouseRotation';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import CameraOrientationState from './CameraOrientationState';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'

// Loading a Line
// const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
// const points = [];
// points.push( new THREE.Vector3( - 10, 0, 0 ) );
// points.push( new THREE.Vector3( 0, 10, 0 ) );
// points.push( new THREE.Vector3( 10, 0, 0 ) );
// const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
// const line = new THREE.Line( lineGeometry, lineMaterial );
// scene.add( line );


//Canvas setup
const threejsCanvas = document.querySelector('.webgl')

//Load textures
const textureLoader = new THREE.TextureLoader()


let skyBoxMaterialArray = []
const skyBoxTextureFT = textureLoader.load("assets/textures/ulukai/corona_ft.png")
const skyBoxTextureBK = textureLoader.load("assets/textures/ulukai/corona_bk.png")
const skyBoxTextureUP = textureLoader.load("assets/textures/ulukai/corona_up.png")
const skyBoxTextureDN = textureLoader.load("assets/textures/ulukai/corona_dn.png")
const skyBoxTextureRT = textureLoader.load("assets/textures/ulukai/corona_rt.png")
const skyBoxTextureLF = textureLoader.load("assets/textures/ulukai/corona_lf.png")
skyBoxMaterialArray.push(new THREE.MeshStandardMaterial({ map: skyBoxTextureFT, side: THREE.BackSide }))
skyBoxMaterialArray.push(new THREE.MeshStandardMaterial({ map: skyBoxTextureBK, side: THREE.BackSide }))
skyBoxMaterialArray.push(new THREE.MeshStandardMaterial({ map: skyBoxTextureUP, side: THREE.BackSide }))
skyBoxMaterialArray.push(new THREE.MeshStandardMaterial({ map: skyBoxTextureDN, side: THREE.BackSide }))
skyBoxMaterialArray.push(new THREE.MeshStandardMaterial({ map: skyBoxTextureRT, side: THREE.BackSide }))
skyBoxMaterialArray.push(new THREE.MeshStandardMaterial({ map: skyBoxTextureLF, side: THREE.BackSide }))

const cubeTexture = textureLoader.load('assets/textures/Sci_fi_Metal_Panel_004_SD/Sci_fi_Metal_Panel_004_basecolor.jpg')
const cubeNormal = textureLoader.load('assets/textures/Sci_fi_Metal_Panel_004_SD/Sci_fi_Metal_Panel_004_normal.jpg')
const cubeMetal = textureLoader.load('assets/textures/Sci_fi_Metal_Panel_004_SD/Sci_fi_Metal_Panel_004_metallic.jpg')
const cubeRoughness = textureLoader.load('assets/textures/Sci_fi_Metal_Panel_004_SD/Sci_fi_Metal_Panel_004_roughness.jpg')
const cubeEmissive = textureLoader.load('assets/textures/Sci_fi_Metal_Panel_004_SD/Sci_fi_Metal_Panel_004_emissive.jpg')


//Handles loading screen
let gameIsLoading = true;
const loadingScreenScene = new THREE.Scene();

//Center of space
const centerOfSpace = new THREE.Vector3(0, 0, 0)


//Setup scene
const scene = new THREE.Scene();


//Setup camera and camera utilties
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();


//Set up default camera state
let cameraOrientationState = new CameraOrientationState();


//Setup renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//Setup 2D renderer
const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
document.body.appendChild(labelRenderer.domElement)

//Load models
const modelLoader = new GLTFLoader();


let shipModel
modelLoader.load("assets/models/stylised_spaceship/scene.gltf", (gltf) => {
    shipModel = gltf.scene
    shipModel.scale.set(0.1, 0.1, 0.1)
    shipModel.position.set(-21.5, -3, 0)
    // shipModel.position.set(290, -3, 0) //Page editing position

    shipModel.rotateY(1.7000000)
    gameIsLoading = false //Turn off loading screen
    scene.add(gltf.scene)
}, undefined, function (error) {

})

//Create sky box
const skyBoxGeometry = new THREE.BoxGeometry(1000, 1000, 1000)
const skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterialArray)
scene.add(skyBox)


//Create cube
const cubeInitialPos = new THREE.Vector3(-250, 0, -100)
const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
const cubeMaterial = new THREE.MeshStandardMaterial({ map: cubeTexture, normalMap: cubeNormal, metalnessMap: cubeMetal, roughnessMap: cubeRoughness, emissiveMap: cubeEmissive });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.x = cubeInitialPos.x
cube.position.y = cubeInitialPos.y
cube.position.z = cubeInitialPos.z
cube.rotateZ(0.3)
scene.add(cube);

//Move camera into initial position
camera.position.set(5, -0.5, 10);


//Create audio
const bgMusicListener = new THREE.AudioListener();
camera.add(bgMusicListener)
const bgMusicSound = new THREE.PositionalAudio(bgMusicListener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('assets/sounds/wandering-6394.mp3', function (buffer) {
    bgMusicSound.setBuffer(buffer);
    bgMusicSound.setLoop(true);
    bgMusicSound.setVolume(3);
    bgMusicSound.play();
});


//Add lighting
const loadingScreenPointLight = new THREE.AmbientLight(0xFFFFFF, 5)
loadingScreenPointLight.penumbra = 1
loadingScreenScene.add(loadingScreenPointLight)


// const wholeSceneLight = new THREE.AmbientLight(0xFFFFFF, 0.2)
// wholeSceneLight.position.set(0, 0, 0)
// scene.add(wholeSceneLight)

const mainShipSpotLight = new THREE.SpotLight(0xFFFFFF, 10, 0, 1)
mainShipSpotLight.color.r = 0.0003
mainShipSpotLight.position.set(0, 0, 0)
mainShipSpotLight.penumbra = 1
mainShipSpotLight.decay = 0.0
scene.add(mainShipSpotLight)


const easterEggPointLight = new THREE.SpotLight(0xFFFFFF, 500)
easterEggPointLight.position.set(0, 1, 5)
easterEggPointLight.penumbra = 1
scene.add(easterEggPointLight)


const easterEggPointLight2 = new THREE.SpotLight(0xFFFFFF, 500)
easterEggPointLight2.position.set(0, 1, 5)
easterEggPointLight2.penumbra = 1
scene.add(easterEggPointLight2)


// Stored positions of pages + creating lighting targets
const openingPagePos = new THREE.Vector3(-25, 1, 0)

const mainPagePos = new THREE.Vector3(0, 1, 0)

const techPagePos = new THREE.Vector3(25, 1, 0)

const projectsPagePos = new THREE.Vector3(50, 0, 0)

const thankyouPagePos = new THREE.Vector3(300, 0, 0)


//Create light helper (shows position of light)
// const lightHelper = new THREE.SpotLightHelper(mainShipSpotLight)
// scene.add(lightHelper)

// const lightHelper2 = new THREE.SpotLightHelper(easterEggPointLight2)
// scene.add(lightHelper2)


// Checks which elements mouse is pointing at and returns them in an array
//Unused
const getHighlightedElements = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {

    }
    return intersects

}


//Takes string input and creates it in the scene
const createText = (textToDisplay, textPosition, fontSize) => {
    const loader = new FontLoader();
    loader.load(
        //Font to be loaded
        'assets/fonts/Bebas_Neue_Regular.json',
        //Creates properties for font
        function (font) {
            const textGeometry = new TextGeometry(textToDisplay, {
                font: font,
                size: fontSize,
                height: 0.1,
            });
            const textMaterial = [
                new THREE.MeshStandardMaterial({ color: "#B8860B", metalness: 1, roughness: 0.5, emissive: '#B8860B' }),
                new THREE.MeshStandardMaterial({ color: "#FFD700" })
            ]
            const textMesh = new THREE.Mesh(textGeometry, textMaterial)
            textMesh.position.set(textPosition.x, textPosition.y, textPosition.z)
            scene.add(textMesh)
        },
        //Outputs progress of font load
        function (xhr) {

        },
        //Outputs error message if font doesn't load
        function (err) {

        }
    );

}


//Takes string input and creates it in the loading screen scene
const createTextLoadingScreen = (textToDisplay, textPosition, fontSize) => {
    const loader = new FontLoader();
    loader.load(
        //Font to be loaded
        'assets/fonts/Comfortaa_Regular.json',
        //Creates properties for font
        function (font) {
            const textGeometry = new TextGeometry(textToDisplay, {
                font: font,
                size: fontSize,
                height: 0.1,
            });
            const textMaterial = new THREE.MeshToonMaterial({ color: "#87C4FF" });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial)
            textMesh.position.set(textPosition.x, textPosition.y, textPosition.z)
            loadingScreenScene.add(textMesh)
        },
        //Outputs progress of font load
        function (xhr) {

        },
        //Outputs error message if font doesn't load
        function (err) {

        }
    );

}


let shipXMomentum = 0.0
const shipSoundListener = new THREE.AudioListener();
const shipSound = new THREE.PositionalAudio(shipSoundListener);
const audioLoader2 = new THREE.AudioLoader();
audioLoader2.load('assets/sounds/hover-engine-6391.mp3', function (buffer) {
    shipSound.setBuffer(buffer);
    shipSound.setRefDistance(10);
    shipSound.setLoop(true);
    shipSound.setLoopStart(6);
    shipSound.setLoopEnd(38.5);
    shipSound.setVolume(0.1);
    shipSound.setPlaybackRate(0.9)
});


const controlShip = () => {
    document.addEventListener("keypress", (event) => {
        if (event.key === "w") {
            // shipXMomentum += 0.006
            shipXMomentum += 0.0002
            shipModel.add(shipSound)
            if (!shipSound.isPlaying) {
                shipSound.play();
            }
        }

        if (event.key === "s") {
            // shipXMomentum -= 0.006
            shipXMomentum -= 0.0002
            if (!shipSound.isPlaying) {
                shipSound.play();
            }
        } else if (event.key === "a") {
            shipModel.rotateX(-0.03)
        } else if (event.key === "d") {
            shipModel.rotateX(0.03)
        }
    })
}


const moveShip = () => {
    shipModel.translateZ(shipXMomentum)
    //Make ship stay 0 on z axis
    if (shipModel.position.x < 300) {
        shipModel.position.z = 0
    }

    camera.position.x = shipModel.position.x
    // skyBox.translateX(shipXMomentum)
    skyBox.position.x = shipModel.position.x


    if (shipXMomentum > 0.0001) {
        shipXMomentum -= shipXMomentum / 1000
    } else if (shipXMomentum < -0.0001) {
        shipXMomentum -= shipXMomentum / 500
    }

    shipModel.position.y = Math.max(-7.8, Math.min(6.9, shipModel.position.y));
    // shipModel.position.x = Math.max(-2, Math.min(1500, shipModel.position.x));

}


let mainLightTargetSet = false
const moveMainShipLight = () => {
    if (mainShipSpotLight) {
        if (mainLightTargetSet === false) {
            mainShipSpotLight.target = shipModel
            mainLightTargetSet = true
        }
        mainShipSpotLight.position.set(camera.position.x, camera.position.y, camera.position.z)
        mainShipSpotLight.position.y = -5
        mainShipSpotLight.position.z = 8
    }


}

let lightStage = 0
const bgColourControl = () => {

    console.log(mainShipSpotLight.color)
    if (lightStage === 0) {
        mainShipSpotLight.color.b += 0.001
        if (mainShipSpotLight.color.b >= 5.0) {
            lightStage = 1
        }

    } else if (lightStage === 1) {
        mainShipSpotLight.color.r += 0.001
        if (mainShipSpotLight.color.r >= 5.0) {
            lightStage = 2
        }

    } else if (lightStage === 2) {
        mainShipSpotLight.color.b -= 0.001
        if (mainShipSpotLight.color.b <= 1.0) {
            lightStage = 3
        }

    } else if (lightStage === 3) {
        mainShipSpotLight.color.r -= 0.001

        if (mainShipSpotLight.color.r <= 1.0) {
            lightStage = 0
        }
    }









}


const alarmSoundListener = new THREE.AudioListener();
const alarmSound = new THREE.Audio(alarmSoundListener);
const audioLoader3 = new THREE.AudioLoader();
audioLoader3.load('assets/sounds/security-alarm-80493.mp3', function (buffer) {
    alarmSound.setBuffer(buffer);
    alarmSound.setVolume(0.05);
});

const spaceAmbienceSound = new THREE.Audio(alarmSoundListener);
audioLoader3.load('assets/sounds/deep-space-ambiance-48854.mp3', function (buffer) {
    spaceAmbienceSound.setBuffer(buffer);
    spaceAmbienceSound.setVolume(1);
});

//Black hole
const blackHoleEndGame = () => {

    if (shipModel.position.x > 330) {
        bgMusicSound.pause()

        mainShipSpotLight.penumbra -= 0.0003
        mainShipSpotLight.angle -= 0.0003

        if (!alarmSound.isPlaying) {
            alarmSound.play();
        }

        if (mainShipSpotLight.angle <= 0.0) {

            mainShipSpotLight.penumbra = -1.0
            alarmSound.pause()
            if (!spaceAmbienceSound.isPlaying) {

                spaceAmbienceSound.play()
            }

            shipModel.translateZ(0.5)
            shipModel.lookAt(shipModel.position.x, 0, -1000)

            if (mainShipSpotLight.angle <= -1.0) {
                mainShipSpotLight.penumbra = -1.0
                mainShipSpotLight.angle = -1.0
            }
        }



    }
}


//Controls cube movement
const rotateCube = () => {
    cube.rotateX(-0.0004)
    cube.translateX(0.0005)
    if (cube.position.y > 150) {
        cube.position.x = cubeInitialPos.x
        cube.position.y = cubeInitialPos.y
        cube.position.z = cubeInitialPos.z
    }
}


//Camera controls - keyboard
const cameraContolsKB = () => {
    //Keyboard Controls
    const cameraSpeed = 0.10
    const cameraRotateSpeed = cameraSpeed / 2
    document.addEventListener("keypress", (event) => {
        if (event.key === "d") {
            camera.translateX(cameraSpeed)
        } else if (event.key === "a") {
            camera.translateX(-cameraSpeed)
        } else if (event.key === "w") {
            camera.translateY(cameraSpeed)
        } else if (event.key === "s") {
            camera.translateY(-cameraSpeed)
        } else if (event.key === "r") {
            camera.translateZ(-cameraSpeed)
        } else if (event.key === "f") {
            camera.translateZ(cameraSpeed)
        } else if (event.key === "q") {
            camera.rotateY(cameraRotateSpeed)
        } else if (event.key === "e") {
            camera.rotateY(-cameraRotateSpeed)
        }
    })
}


//Changes elements colour red (element must be of a certain mesh type or it wont have a color property)
const changeElementColor = (event) => {
    const elementsToChange = getHighlightedElements(event)
    for (let i = 0; i < elementsToChange.length; i++) {
        elementsToChange[i].object.material.color?.set(0xff0000)
    }
}


const onMouseMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;

    handleMouseMovement(pointer.x, pointer.y, cameraOrientationState)

}


const generateLoadingScreen = () => {
    createTextLoadingScreen("Loading Please Wait...", { x: -3, y: 0.0, z: 0.0 }, 1.0)
}

const generateOpeningPage = () => {
    let wasdPos = { x: -21.9, y: 1.5, z: 0 }
    createText("W", { x: wasdPos.x, y: wasdPos.y, z: wasdPos.z }, 1)
    createText("A", { x: wasdPos.x - 0.8, y: wasdPos.y - 1.5, z: wasdPos.z }, 1)
    createText("S", { x: wasdPos.x + 0.1, y: wasdPos.y - 1.5, z: wasdPos.z }, 1)
    createText("D", { x: wasdPos.x + 1, y: wasdPos.y - 1.5, z: wasdPos.z }, 1)
    createText("TO MOVE", { x: -23.5, y: -1.5, z: 0 }, 1)
    createText("[ Please set page zoom to 100% ]", { x: -27.5, y: -5, z: 0 }, 0.8)
    createText("-->", { x: -17, y: -1.5, z: 0 }, 1)
}

const generateMainPage = () => {
    //Title
    createText("Ryan Foster-Hill", mainPagePos, 1.0)

    // Welcome message
    createText("Hi", { x: 3.3, y: -0.2, z: 0 }, 0.7)
    createText("Welcome to my portfolio", { x: -0.3, y: -1.5, z: 0 }, 0.7)

}

const generateTechPage = () => {
    createText("Bio", techPagePos, 1.0)
    createText("Fullstack web developer", { x: 23, y: 0, z: 0 }, 0.5)
    createText("Tech : React, Node, Express, MongoDB", { x: 22, y: -1, z: 0 }, 0.5)
    // createText("looking for junior role", { x: 23.1, y: -1, z: 0 }, 0.5)

}

let testText = createText("[Click image to see details]", { x: 71.5, y: -7.7, z: 0 }, 0.5)
const generateProjectsPage = () => {


    createText("Projects ->", projectsPagePos, 1.0)
    const calcImg = document.createElement('img')
    calcImg.src = "assets/images/Screenshot_calculator.png"
    calcImg.width = 500
    const calcImgObj = new CSS2DObject(calcImg)
    scene.add(calcImgObj)
    calcImgObj.position.set(75, 0, 0)
    createText("React Calculator", { x: 70.7, y: -7, z: 0 }, 1.0)
    createText("[Click image to see details]", { x: 71.5, y: -7.7, z: 0 }, 0.5)
    calcImg.addEventListener("mousedown", (event) => {
        createText("Fully functional calculator", { x: 79.5, y: 1, z: 0 }, 0.7)
        createText("thorough error checking", { x: 79.5, y: -1, z: 0 }, 0.7)
        createText("+", { x: 83.5, y: -1.8, z: 0 }, 0.7)
        createText("error handling", { x: 81.2, y: -2.6, z: 0 }, 0.7)
    })


    const catsImg = document.createElement('img')
    catsImg.src = "assets/images/Screenshot_cats.png"
    catsImg.width = 1300
    const catsImgObj = new CSS2DObject(catsImg)
    scene.add(catsImgObj)
    catsImgObj.position.set(105, 0, 0)
    createText("React E-Commerce Site", { x: 99, y: -7, z: 0 }, 1.0)
    createText("[Click image to see details]", { x: 101, y: -7.7, z: 0 }, 0.5)
    catsImg.addEventListener("mousedown", (event) => {
        createText("Features:", { x: 116.5, y: 2, z: 0 }, 0.7)
        createText("searching", { x: 116.5, y: 0.5, z: 0 }, 0.7)
        createText("Uses various APIs to generate data", { x: 116.5, y: -1, z: 0 }, 0.7)
        createText("Results sorting", { x: 116.5, y: -2.5, z: 0 }, 0.7)
        createText("Basket system", { x: 116.5, y: -4, z: 0 }, 0.7)
    })

    const musikaImg = document.createElement('img')
    musikaImg.src = "assets/images/Screenshot_musika.png"
    musikaImg.width = 1300
    const musikaImgObj = new CSS2DObject(musikaImg)
    scene.add(musikaImgObj)
    musikaImgObj.position.set(145, 0, 0)
    createText("React Music Website", { x: 140, y: -7, z: 0 }, 1.0)
    createText("[Click image to see details]", { x: 141.5, y: -7.7, z: 0 }, 0.5)
    musikaImg.addEventListener("mousedown", (event) => {
        createText("Full stack project", { x: 156, y: 1, z: 0 }, 0.7)
        createText("Backend used to store user data", { x: 156, y: 0, z: 0 }, 0.7)
        createText("Connects to Spotify API for searching", { x: 156, y: -1, z: 0 }, 0.7)
        createText("Persistent radio player throughout site", { x: 156, y: -2, z: 0 }, 0.7)
        createText("news/events personalized to user", { x: 156, y: -3, z: 0 }, 0.7)
    })


    const diceImg = document.createElement('img')
    diceImg.src = "assets/images/Screenshot_dicegame.png"
    diceImg.width = 1300
    const diceImgObj = new CSS2DObject(diceImg)
    scene.add(diceImgObj)
    diceImgObj.position.set(185, 0, 0)
    createText("JS Dice Game", { x: 182, y: -6, z: 0 }, 1.0)
    createText("[Click image to see details]", { x: 181.6, y: -7, z: 0 }, 0.5)
    diceImg.addEventListener("mousedown", (event) => {
        createText("Dynamic design", { x: 196, y: 1, z: 0 }, 0.7)
        createText("allowing unlimited", { x: 196, y: 0, z: 0 }, 0.7)
        createText("amount of players", { x: 196, y: -1, z: 0 }, 0.7)
    })



    const sandyImg = document.createElement('img')
    sandyImg.src = "assets/images/Screenshot_sandyandeli.png"
    sandyImg.width = 1400
    const sandyImgObj = new CSS2DObject(sandyImg)
    scene.add(sandyImgObj)
    sandyImgObj.position.set(225, 0, 0)
    createText("Painting and Decorating Site", { x: 219, y: -7, z: 0 }, 1.0)
    createText("[Click image to see details]", { x: 222, y: -7.7, z: 0 }, 0.5)
    sandyImg.addEventListener("mousedown", (event) => {
        createText("painting and decorating review site", { x: 237, y: 1, z: 0 }, 0.7)
        createText("Utilizes bootstrap", { x: 237, y: 0, z: 0 }, 0.7)
    })




    const todoImg = document.createElement('img')
    todoImg.src = "assets/images/Screenshot_todolist.png"
    todoImg.width = 1700
    const todoImgObj = new CSS2DObject(todoImg)
    scene.add(todoImgObj)
    todoImgObj.position.set(270, 0, 0)
    createText("React To-Do List", { x: 266, y: -5, z: 0 }, 1.0)
    createText("[Click image to see details]", { x: 266.6, y: -6, z: 0 }, 0.5)
    todoImg.addEventListener("mousedown", (event) => {
        createText("Simple design", { x: 284.5, y: 0, z: 0 }, 0.7)
        createText("Colour coded UI", { x: 284.5, y: -1, z: 0 }, 0.7)
    })



}

const generateThankyouPage = () => {
    createText("Thankyou for playing! -->", thankyouPagePos, 1.0)
}

//Make images clickable and popup html text of site description
//Add more pages

//ADD DISABLE CAPS LOCK WARNING MESSAGE
//FINISH CLICKABLE IMAGE DESCRIPTIONS

//Setup site functionality
generateLoadingScreen()
// window.addEventListener('pointermove', changeElementColor)
window.addEventListener('pointermove', onMouseMove)
// cameraContolsKB()
generateOpeningPage()
generateMainPage()
generateTechPage()
generateProjectsPage()
generateThankyouPage()
controlShip()


function animate() {
    if (gameIsLoading) {
        requestAnimationFrame(animate);
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.render(loadingScreenScene, camera);
    } else {
        // handleCameraRotation(camera, cameraOrientationState);

        //Auto update screens size/camera aspect ratio
        renderer.setSize(window.innerWidth, window.innerHeight)
        labelRenderer.setSize(window.innerWidth, window.innerHeight)
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix();


        requestAnimationFrame(animate);
        renderer.render(scene, camera);


        //HTML renderer
        labelRenderer.render(scene, camera)


        rotateCube()
        moveShip()
        moveMainShipLight()
        blackHoleEndGame()
        bgColourControl()
    }

}


//If user has WebGL then begin render loop, else send error message
if (WebGL.isWebGLAvailable()) {
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);

}