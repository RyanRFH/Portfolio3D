import * as THREE from 'three'
import WebGL from 'three/addons/capabilities/WebGL.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { handleCameraRotation, handleMouseMovement } from './CameraWithMouseRotation';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import CameraOrientationState from './CameraOrientationState';
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer'

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
console.log(threejsCanvas)

//Load textures
const textureLoader = new THREE.TextureLoader()

// const backgroundTexture = textureLoader.load('assets/textures/Lava_005_SD/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner.jpg')


// const fontTexture = textureLoader.load('assets/textures/cloth-textile-texture-background-close-up-fabric-83992189.jpg')
// const fontDisplacement = textureLoader.load('assets/textures/White_Marble_005_SD/White_Marble_005_DISP.png')
// const fontNormal = textureLoader.load('assets/textures/White_Marble_005_SD/White_Marble_005_NORM.jpg')
// const fontOcclusion = textureLoader.load('assets/textures/White_Marble_005_SD/White_Marble_005_OCC.jpg')
// const fontSpec = textureLoader.load('assets/textures/White_Marble_005_SD/Abstract_004_SPEC.jpg')
// const fontHeight = textureLoader.load('assets/textures/White_Marble_005_SD/Marble_White_005_height.png')
// const fontRoughness = textureLoader.load('assets/textures/White_Marble_005_SD/White_Marble_005_ROUGH.jpg')

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

const sphereTexture = textureLoader.load('assets/textures/Lava_005_SD/Lava_005_COLOR.jpg')
const sphereNormal = textureLoader.load('assets/textures/Lava_005_SD/Lava_005_NORM.jpg')
const sphereRoughness = textureLoader.load('assets/textures/Lava_005_SD/Lava_005_ROUGH.jpg')
const sphereDisplacement = textureLoader.load('assets/textures/Lava_005_SD/Lava_005_DISP.png')
const sphereAO = textureLoader.load('assets/textures/Lava_005_SD/Lava_005_OCC.jpg')
const sphereAlpha = textureLoader.load('assets/textures/Lava_005_SD/Lava_005_MASK.jpg')

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
const renderer = new THREE.WebGLRenderer();
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

let carModel
modelLoader.load("assets/models/free_1975_porsche_911_930_turbo/scene.gltf", (gltf) => {
    carModel = gltf.scene
    scene.add(gltf.scene)
    carModel.position.set(40, 1, -5)
    gameIsLoading = false //Turn off loading screen
}, undefined, function (error) {
    console.log("Error in model loader = ", error)
})


let shipModel
modelLoader.load("assets/models/stylised_spaceship/scene.gltf", (gltf) => {
    shipModel = gltf.scene
    shipModel.scale.set(0.1, 0.1, 0.1)
    shipModel.position.set(3.5, -3, 0)
    // shipModel.position.set(240, -3, 0) //Page editing position
    shipModel.rotateY(1.7000000)
    scene.add(gltf.scene)
}, undefined, function (error) {
    console.log("Error in model loader = ", error)
})

let eggModel
modelLoader.load("assets/models/easter_eggs_2016_-_white__red_-_1/scene.gltf", (gltf) => {
    eggModel = gltf.scene
    scene.add(gltf.scene)
    eggModel.position.set(700, -1, -10)
    eggModel.scale.set(350, 350, 350)
}, undefined, function (error) {
    console.log("Error in model loader = ", error)
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


//Create sphere
const sphereGeometry = new THREE.SphereGeometry(8)
const sphereMaterial = new THREE.MeshStandardMaterial({ map: sphereTexture, normalMap: sphereNormal, displacementMap: sphereDisplacement, roughnessMap: sphereRoughness, aoMap: sphereAO, alphaMap: sphereAlpha })
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.position.set(100, 30, -100)
scene.add(sphere)


//Move camera into initial position
camera.position.set(5, -0.5, 10);


//Create audio
// const listener = new THREE.AudioListener();
// camera.add(listener)
// const sound = new THREE.PositionalAudio(listener);

//Add lighting
const loadingScreenPointLight = new THREE.AmbientLight(0xFFFFFF, 10)
loadingScreenPointLight.penumbra = 1
loadingScreenScene.add(loadingScreenPointLight)
// const audioLoader = new THREE.AudioLoader();
// audioLoader.load('assets/sounds/', function (buffer) {
//     sound.setBuffer(buffer);
//     sound.setLoop(true);
//     sound.setVolume(0.1);
//     sound.play();
// });

const wholeSceneLight = new THREE.AmbientLight(0xFFFFFF, 0.2)
wholeSceneLight.position.set(0, 0, 0)
scene.add(wholeSceneLight)

const mainPagePointLight = new THREE.SpotLight(0xFFFFFF, 500)
mainPagePointLight.position.set(10, 2, 9)
mainPagePointLight.penumbra = 1
scene.add(mainPagePointLight)

const techPagePointLight = new THREE.PointLight(0xFFFFFF, 100)
techPagePointLight.position.set(26, 4, 4)
techPagePointLight.penumbra = 1
scene.add(techPagePointLight)

const projectsPagePointLight = new THREE.PointLight(0xFFFFFF, 100)
projectsPagePointLight.position.set(52, 4, 4)
projectsPagePointLight.penumbra = 1
scene.add(projectsPagePointLight)

const thankyouPagePointLight = new THREE.PointLight(0xFFFFFF, 100)
thankyouPagePointLight.position.set(254, 4, 4)
thankyouPagePointLight.penumbra = 1
scene.add(thankyouPagePointLight)

const easterEggPointLight = new THREE.PointLight(0xFFFFFF, 3000)
easterEggPointLight.position.set(0, 7, 15)
easterEggPointLight.penumbra = 1
scene.add(easterEggPointLight)

const easterEggPointLight2 = new THREE.PointLight(0xFFFFFF, 3000)
easterEggPointLight2.position.set(0, 7, 15)
easterEggPointLight2.penumbra = 1
scene.add(easterEggPointLight2)

const shipLight = new THREE.PointLight(0xFFFFFF, 50)
shipLight.position.set(200, 1000, -10) //Offscreen
shipLight.penumbra = 1
scene.add(shipLight)

const calculatorLight = new THREE.PointLight(0xFFFFFF, 50)
calculatorLight.position.set(65, -3, 0)
calculatorLight.penumbra = 1
scene.add(calculatorLight)

const catsLight = new THREE.PointLight(0xFFFFFF, 50)
catsLight.position.set(84, -3, 0)
catsLight.penumbra = 1
scene.add(catsLight)

const musikaLight = new THREE.PointLight(0xFFFFFF, 50)
musikaLight.position.set(115, -3, 0)
musikaLight.penumbra = 1
scene.add(musikaLight)

const diceLight = new THREE.PointLight(0xFFFFFF, 50)
diceLight.position.set(145, -3, 0)
diceLight.penumbra = 1
scene.add(diceLight)

const sandyLight = new THREE.PointLight(0xFFFFFF, 100)
sandyLight.position.set(175, -2, 0)
sandyLight.penumbra = 1
scene.add(sandyLight)

const todoLight = new THREE.PointLight(0xFFFFFF, 50)
todoLight.position.set(210, -1, 0)
todoLight.penumbra = 1
scene.add(todoLight)

const theEndLight = new THREE.PointLight(0xFFFFFF, 50)
theEndLight.position.set(801, 4, 0)
theEndLight.penumbra = 1
scene.add(theEndLight)


// Stored positions of pages + creating lighting targets
const mainPagePos = new THREE.Vector3(0, 1, 0)
const mainSpotTarget = new THREE.Object3D();
mainSpotTarget.position.set(mainPagePos.x, 1, 0)
mainPagePointLight.target = mainSpotTarget;
scene.add(mainSpotTarget);

const techPagePos = new THREE.Vector3(25, 1, 0)
const techSpotTarget = new THREE.Object3D();
techSpotTarget.position.set(techPagePos.x, 1, 0)
techPagePointLight.target = techSpotTarget;
scene.add(techSpotTarget);

const projectsPagePos = new THREE.Vector3(50, 0, 0)
const projectsSpotTarget = new THREE.Object3D();
projectsSpotTarget.position.set(projectsPagePos.x, 1, 0)
projectsPagePointLight.target = projectsSpotTarget;
scene.add(projectsSpotTarget);

const thankyouPagePos = new THREE.Vector3(250, 0, 0)
const thankyouSpotTarget = new THREE.Object3D();
thankyouSpotTarget.position.set(thankyouPagePos.x, 1, 0)
thankyouPagePointLight.target = thankyouSpotTarget;
scene.add(thankyouSpotTarget);


//Create light helper (shows position of light)
// const lightHelper = new THREE.PointLightHelper(techPagePointLight)
// scene.add(lightHelper)


// Checks which elements mouse is pointing at and returns them in an array
//Unused
const getHighlightedElements = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {
        console.log(intersects)
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
                height: 0.2,
            });
            const textMaterial = [
                new THREE.MeshToonMaterial({ color: "#87C4FF" }),
                new THREE.MeshToonMaterial({ color: "#39A7FF" })
            ]
            const textMesh = new THREE.Mesh(textGeometry, textMaterial)
            textMesh.position.set(textPosition.x, textPosition.y, textPosition.z)
            scene.add(textMesh)
        },
        //Outputs progress of font load
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        //Outputs error message if font doesn't load
        function (err) {
            console.log('An error happened');
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
                height: 0.3,
            });
            const textMaterial = new THREE.MeshToonMaterial({ color: "#87C4FF" });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial)
            textMesh.position.set(textPosition.x, textPosition.y, textPosition.z)
            loadingScreenScene.add(textMesh)
        },
        //Outputs progress of font load
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        //Outputs error message if font doesn't load
        function (err) {
            console.log('An error happened');
        }
    );

}


let shipXMomentum = 0.0
let shipStartAudioPlayed = false
const controlShip = () => {
    document.addEventListener("keypress", (event) => {
        if (event.key === "w") {
            // shipXMomentum += 0.006
            shipXMomentum += 0.0006
        } else if (event.key === "s") {
            // shipXMomentum -= 0.006
            shipXMomentum -= 0.0006
        } else if (event.key === "a") {
            shipModel.rotateX(-0.03)
        } else if (event.key === "d") {
            shipModel.rotateX(0.03)
        }

        //Add audio
        // if (shipStartAudioPlayed === false) {
        //     const audioLoader = new THREE.AudioLoader();
        //     shipModel.add(sound)
        //     audioLoader.load( 'assets/sounds/futuristic-sound-96179.mp3', function( buffer ) {
        //         sound.setBuffer( buffer );
        //         sound.setRefDistance( 10 );
        //         sound.play();
        //         sound.setVolume(0.1)
        //     });

        //     shipStartAudioPlayed = true
        // }
    })
}

const moveShip = () => {
    shipModel.translateZ(shipXMomentum)
    //Make ship stay 0 on z axis
    if (shipModel.position.x < 300) {
        shipModel.position.z = 0
    }

    camera.position.x = shipModel.position.x
    skyBox.translateX(shipXMomentum)
    if (shipXMomentum > 0.0001) {
        shipXMomentum -= shipXMomentum / 1000
    } else if (shipXMomentum < -0.0001) {
        shipXMomentum -= shipXMomentum / 500
    }

}

//Audio Controller
const audioController = () => {

}

//Easter egg
const easterEgg = () => {
    // easterEggPointLight?.lookAt(eggModel.position)
    easterEggPointLight.position.x = eggModel?.position.x - 20
    easterEggPointLight2.position.x = eggModel?.position.x + 20
    if (shipModel.position.x > 660 && shipModel.position.x < 675) {
        shipXMomentum = 0.01
    }
    eggModel.rotateY(0.0005)
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


//Controls sphere movement
const rotateSphere = () => {
    sphere.rotateX(-0.0001)
    sphere.translateX(-0.00005)
}


//Controls car movement
const rotateCar = () => {
    if (carModel) {
        carModel.rotateX(0.0008)
        carModel.rotateY(-0.0008)
        carModel.translateX(0.0008)
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
        console.log(elementsToChange[i])
        elementsToChange[i].object.material.color?.set(0xff0000)
    }
}


const onMouseMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;

    handleMouseMovement(pointer.x, pointer.y, cameraOrientationState)

}

const endGame = () => {
    createText("THE END", {x:800, y:0, z:0}, 1.0)
}


const generateLoadingScreen = () => {
    createTextLoadingScreen("Loading Please Wait", { x: -3, y: 0.0, z: 0.0 }, 1.0)
}

const generateMainPage = () => {
    //Title
    createText("Ryan Foster-Hill", mainPagePos, 1.0)

    // Welcome message
    createText("Hi", { x: 3.3, y: -0.2, z: 0 }, 0.7)
    createText("Welcome to my portfolio", { x: -0.3, y: -1.5, z: 0 }, 0.7)
    createText("W A S D", { x: 2.7, y: -4.5, z: 0 }, 0.5)
    createText("TO MOVE", { x: 2.5, y: -5.2, z: 0 }, 0.5)
    createText("[ Please set page zoom to 100% ]", { x: 0.65, y: -6, z: 0 }, 0.4)
}

const generateTechPage = () => {
    createText("Bio", techPagePos, 1.0)
    createText("Fullstack web developer", { x: 23, y: 0, z: 0 }, 0.5)
    createText("Tech : React, Node, Express, MongoDB", { x: 22, y: -1, z: 0 }, 0.5)
    // createText("looking for junior role", { x: 23.1, y: -1, z: 0 }, 0.5)

}

const generateProjectsPage = () => {
    createText("Projects ->", projectsPagePos, 1.0)
    const calcImg = document.createElement('img')
    calcImg.src = "assets/images/Screenshot_calculator.png"
    calcImg.width = 500
    const calcImgObj = new CSS2DObject(calcImg)
    scene.add(calcImgObj)
    calcImgObj.position.set(65,0,0)
    createText("React Calculator",{x:60.7,y:-7,z:0} , 1.0)

    const catsImg = document.createElement('img')
    catsImg.src = "assets/images/Screenshot_cats.png"
    catsImg.width = 1300
    const catsImgObj = new CSS2DObject(catsImg)
    scene.add(catsImgObj)
    catsImgObj.position.set(85,0,0)
    createText("React E-Commerce Site",{x:79,y:-7,z:0} , 1.0)

    const musikaImg = document.createElement('img')
    musikaImg.src = "assets/images/Screenshot_musika.png"
    musikaImg.width = 1300
    const musikaImgObj = new CSS2DObject(musikaImg)
    scene.add(musikaImgObj)
    musikaImgObj.position.set(115,0,0)
    createText("React Music Website",{x:110,y:-7,z:0} , 1.0)

    const diceImg = document.createElement('img')
    diceImg.src = "assets/images/Screenshot_dicegame.png"
    diceImg.width = 1300
    const diceImgObj = new CSS2DObject(diceImg)
    scene.add(diceImgObj)
    diceImgObj.position.set(145,0,0)
    createText("JS Dice Game",{x:142,y:-6,z:0} , 1.0)

    const sandyImg = document.createElement('img')
    sandyImg.src = "assets/images/Screenshot_sandyandeli.png"
    sandyImg.width = 1400
    const sandyImgObj = new CSS2DObject(sandyImg)
    scene.add(sandyImgObj)
    sandyImgObj.position.set(175,0,0)
    createText("Painting and Decorating Site",{x:169,y:-7,z:0} , 1.0)


    const todoImg = document.createElement('img')
    todoImg.src = "assets/images/Screenshot_todolist.png"
    todoImg.width = 1700
    const todoImgObj = new CSS2DObject(todoImg)
    scene.add(todoImgObj)
    todoImgObj.position.set(210,0,0)
    createText("React To-Do List",{x:206,y:-5,z:0} , 1.0)




}

const generateThankyouPage = () => {
    createText("Thankyou for playing!", thankyouPagePos, 1.0)
}

//after finished (reset ship speed to default)
//ADD SHIPS/STARS FLYING FAR IN BACKGROUND
//Make images clickable and popup html text of site description
//Add more pages

//Setup site functionality
generateLoadingScreen()
// window.addEventListener('pointermove', changeElementColor)
window.addEventListener('pointermove', onMouseMove)
// cameraContolsKB()
generateMainPage()
generateTechPage()
generateProjectsPage()
generateThankyouPage()
endGame()
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

        console.log(camera.aspect)

        //HTML renderer
        labelRenderer.render(scene, camera)


        rotateSphere()
        rotateCube()
        rotateCar()
        moveShip()
        easterEgg()


    }

}


//If user has WebGL then begin render loop, else send error message
if (WebGL.isWebGLAvailable()) {
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);

}