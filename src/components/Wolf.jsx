import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {Canvas, useThree} from '@react-three/fiber'
import { OrbitControls,useAnimations,useGLTF, useTexture } from '@react-three/drei';
import gsap from "gsap";
import {useGSAP} from '@gsap/react'
import { ScrollTrigger} from "gsap/ScrollTrigger";



const Wolf = () => {

  gsap.registerPlugin(useGSAP())
  gsap.registerPlugin(ScrollTrigger)

    const modal =  useGLTF("/public/modals/dog.drc.glb")
    useThree(({camera, scene, gl})=>{
        // console.log(camera.position);
        camera.position.z= 0.55
        //for better3D coloring beacuse webGlRenderer render weak ,fade colors not bright and strong so we use these 2 lines below
        gl.toneMapping = THREE.ReinhardToneMapping
        gl.outputColorSpace = THREE.SRGBColorSpace
        
    })

    //play the animation
    const {actions} = useAnimations(modal.animations,modal.scene)
    useEffect(()=>{
      actions["Take 001"].play()          //Take 001 is animation's name caught by vscode
    },[ actions ])
 
    // destructuring
    const[normalMap, sampleMatCap ] =(useTexture(["/modals/dog_normals.jpg","/matcap/mat-2.png",]))
    .map(texture => {
      texture.flipY = false
      texture.colorSpace = THREE.SRGBColorSpace
      return texture;
    })

    
    //destructuring
    const [ branchMap, branchNormalMap] = (useTexture(["/modals/branches_diffuse.jpg","/modals/branches_normals.jpg"]))
    .map(texture=>{
      texture.flipY = false
      texture.colorSpace = THREE.SRGBColorSpace
      return texture;
    })
  
    //destructuring matcap images
    const [
      mat1,
      mat2,
      mat3,
      mat4,
      mat5,
      mat6,
      mat7,
      mat8,
      mat9,
      mat10,
      mat11,
      mat12,
      mat13,
      mat14,
      mat15,
      mat16,
      mat17,
      mat18,
      mat19,
      mat20,
    ] = (useTexture([
      "/matcap/mat-1.png",
      "/matcap/mat-2.png",
      "/matcap/mat-3.png",
      "/matcap/mat-4.png",
      "/matcap/mat-5.png",
      "/matcap/mat-6.png",
      "/matcap/mat-7.png",
      "/matcap/mat-8.png",
      "/matcap/mat-9.png",
      "/matcap/mat-10.png",
      "/matcap/mat-11.png",
      "/matcap/mat-12.png",
      "/matcap/mat-13.png",
      "/matcap/mat-14.png",
      "/matcap/mat-15.png",
      "/matcap/mat-16.png",
      "/matcap/mat-17.png",
      "/matcap/mat-18.png",
      "/matcap/mat-19.png",
      "/matcap/mat-20.png",
    ])).map(texture=> {
      texture.colorSpace =THREE.SRGBColorSpace
      return texture
    })

    const material = useRef({
      uMatcap1: { value: mat19},
      uMatcap2: { value: mat2},
      uProgress:{ value: 1.0}       //UProgress value --> btata hai dono matcap kitna kitna % share krne vake hain is particular 3d model ke upar

    })
  

   //dogMaterial
    const dogMaterial = new THREE.MeshMatcapMaterial({
      normalMap: normalMap,
      matcap: sampleMatCap
    })
   //branchMaterial
    const branchMaterial = new THREE.MeshMatcapMaterial({
      normalMap: branchNormalMap,
      map:branchMap
    })
    
    //onBeforeCompile==>har ek frame ko chalane se pehle apne vertex shader or fragment shader ka code edit kr sakte hain.
    function onBeforeCompile(shader){
      shader.uniforms.uMatcapTexture1 = material.current.uMatcap1
      shader.uniforms.uMatcapTexture2 = material.current.uMatcap2
      shader.uniforms.uProgress = material.current.uProgress

    
      shader.fragmentShader = shader.fragmentShader.replace(
            "void main() {",
            `
        uniform sampler2D uMatcapTexture1;
        uniform sampler2D uMatcapTexture2;
        uniform float uProgress;

        void main() {
        `
        )

        shader.fragmentShader = shader.fragmentShader.replace(
            "vec4 matcapColor = texture2D( matcap, uv );",
            `
          vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
          vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
          float transitionFactor  = 0.2;
          
          float progress = smoothstep(uProgress - transitionFactor,uProgress, (vViewPosition.x+vViewPosition.y)*0.5 + 0.5);

          vec4 matcapColor = mix(matcapColor2, matcapColor1, progress );
        `
        )
    }

    dogMaterial.onBeforeCompile = onBeforeCompile

    //here traverse will run 108 times bcoz we have 108 objects pure scene me.....so yaha 108 materials banre hai matcap ke jki achi practice nhi hai so hum yaha merial ek baar banyenge and usko use krenge 108 times..
    modal.scene.traverse((child)=>{        
      if(child.name.includes("DOG")){
        // child apne aap me ek mesh hai and mesh is madeupof (shape and material) and normalMap works on material
        child.material = dogMaterial
      }else{
        child.material = branchMaterial
      }
    })

    const dogModal = useRef(modal)
    useGSAP(()=>{

      const tl = gsap.timeline({
        scrollTrigger:{
          trigger: "#section-1",
          endTrigger: "#section-4",
          start:"top top",       //section-1 ka top
          end: "top top",   //section-4 ka bottom
          scrub:true
        }
      })

    tl
    .to(dogModal.current.scene.position,{
      z:  "-=0.75",
      y: "+=0.1"
    })
    .to(dogModal.current.scene.rotation,{
      x: `+=${Math.PI / 15}`
    })
    .to(dogModal.current.scene.rotation,{
      y: `-=${Math.PI}`,
    },"third")
    .to(dogModal.current.scene.position,{
      x:"-=0.5",
      z:"+=0.6",
      y:"-=0.05"
    },"third")

    },[])

    useEffect(()=>{
      document.querySelector(`.title[img-title="TommorrowLand"]`).addEventListener("mouseenter",()=>{
        material.current.uMatcap1.value = mat19
        gsap.to(material.current.uProgress,{
          value: 0.0,
          duration:0.7,
          onComplete:()=>{
            material.current.uMatcap2.value = material.current.uMatcap1.value
            material.current.uProgress.value = 1.0
          }
        })
      })
      document.querySelector(`.title[img-title="Navy-pier"]`).addEventListener("mouseenter",()=>{
        material.current.uMatcap1.value = mat8

        gsap.to(material.current.uProgress,{
          value: 0.0,
          duration:0.7,
          onComplete:()=>{
            material.current.uMatcap2.value = material.current.uMatcap1.value
            material.current.uProgress.value = 1.0
          }
        })
      })
      document.querySelector(`.title[img-title="MSI-chicago"]`).addEventListener("mouseenter",()=>{
        material.current.uMatcap1.value = mat9

        gsap.to(material.current.uProgress,{
          value: 0.0,
          duration:0.7,
          onComplete:()=>{
            material.current.uMatcap2.value = material.current.uMatcap1.value
            material.current.uProgress.value = 1.0
          }
        })
      })
      document.querySelector(`.title[img-title="Louise-phone"]`).addEventListener("mouseenter",()=>{
        material.current.uMatcap1.value = mat12

        gsap.to(material.current.uProgress,{
          value: 0.0,
          duration:0.7,
          onComplete:()=>{
            material.current.uMatcap2.value = material.current.uMatcap1.value
            material.current.uProgress.value = 1.0
          }
        })
      })
      document.querySelector(`.title[img-title="KIKI"]`).addEventListener("mouseenter",()=>{
        material.current.uMatcap1.value = mat10

        gsap.to(material.current.uProgress,{
          value: 0.0,
          duration:0.7,
          onComplete:()=>{
            material.current.uMatcap2.value = material.current.uMatcap1.value
            material.current.uProgress.value = 1.0
          }
        })
      })
      document.querySelector(`.title[img-title="Kennady"]`).addEventListener("mouseenter",()=>{
        material.current.uMatcap1.value = mat8

        gsap.to(material.current.uProgress,{
          value: 0.0,
          duration:0.7,
          onComplete:()=>{
            material.current.uMatcap2.value = material.current.uMatcap1.value
            material.current.uProgress.value = 1.0
          }
        })
      })
      document.querySelector(`.title[img-title="royal-opera"]`).addEventListener("mouseenter",()=>{
        material.current.uMatcap1.value = mat13

        gsap.to(material.current.uProgress,{
          value: 0.0,
          duration:0.7,
          onComplete:()=>{
            material.current.uMatcap2.value = material.current.uMatcap1.value
            material.current.uProgress.value = 1.0
          }
        })
      })
      document.querySelector(".titles").addEventListener("mouseleave",()=>{
        material.current.uMatcap1.value = mat2

        gsap.to(material.current.uProgress,{
          value: 0.0,
          duration:0.7,
          onComplete:()=>{
            material.current.uMatcap2.value = material.current.uMatcap1.value
            material.current.uProgress.value = 1.0
          }
        })

      })


    },[])
    
  return (
    <>
    {/* threejs takes pi value as 180 deg */}
    <primitive ref={modal} object={modal.scene} position={[0.2,-0.6,0]} rotation={[0,Math.PI/4.1,0]} />  
    <directionalLight position={[0,5,5]} color={0xffffff} intensity={10} />
    {/* <OrbitControls/> */}
    
        
    </>
  )
}

export default Wolf
