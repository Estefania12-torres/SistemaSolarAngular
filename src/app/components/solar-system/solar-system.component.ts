import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-solar-system',
  templateUrl: './solar-system.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./solar-system.component.css']
})
export class SolarSystemComponent implements OnInit {
  @ViewChild('canvas', { static: false }) private canvasRef!: ElementRef;
  ngAfterViewInit(): void {
    this.initScene();
    this.animate();
  }

  ngOnInit(): void {
    this.initScene();
    this.animate();
  }

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private sun!: THREE.Mesh;
  private controls!: OrbitControls;
  private planets: {
    name: string;
    mesh?: THREE.Mesh;
    orbitRadius: number;
    speed: number;
    angle: number;
    info: string;
    texture: string;
  }[] = [];

  //selecciona los planetas para que salga la informacion
  selectedPlanet: any = null;
  //controla la velocidad de todos los planetas
  orbitSpeed: number = 0.001;

  // Planetas: [nombre, radio orbita, velocidad angular, tamaño, textura]
  planetData = [
    { name: 'Mercurio', orbitRadius: 14, speed: 0.03, size: 0.8, texture: 'assets/textures/mercury.jpg', info: 'Mercurio es el planeta más cercano al Sol.' },
    { name: 'Venus', orbitRadius: 18, speed: 0.015, size: 1.2, texture: 'assets/textures/venus.jpg', info: 'Venus tiene una atmósfera muy densa.' },
    { name: 'Tierra', orbitRadius: 22, speed: 0.01, size: 1.3, texture: 'assets/textures/earth.jpg', info: 'Nuestro hogar azul.' },
    { name: 'Marte', orbitRadius: 26, speed: 0.008, size: 1.1, texture: 'assets/textures/mars.jpg', info: 'El planeta rojo.' },
    { name: 'Júpiter', orbitRadius: 34, speed: 0.005, size: 3.2, texture: 'assets/textures/jupiter.jpg', info: 'El planeta más grande del sistema solar.' },
    { name: 'Saturno', orbitRadius: 47, speed: 0.004, size: 2.5, texture: 'assets/textures/saturn.jpg', info: 'Famoso por sus anillos.', hasRings: true },
    { name: 'Urano', orbitRadius: 60, speed: 0.003, size: 2.3, texture: 'assets/textures/uranus.jpg', info: 'Un gigante helado inclinado.' },
    { name: 'Neptuno', orbitRadius: 68, speed: 0.0025, size: 2.4, texture: 'assets/textures/neptune.jpg', info: 'Planeta más lejano del Sol.' },
  ];

  private textureLoader = new THREE.TextureLoader();

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }



  private initScene(): void {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(75, 100, 75); // vista cenital (desde arriba)
    this.camera.lookAt(0, 0, 0);         // mirar hacia el Sol

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    //via lactea
    const bgTexture = this.textureLoader.load('assets/textures/milkyway.jpg');
    this.scene.background = bgTexture;

    // Luz desde el Sol
    const pointLight = new THREE.PointLight(0xffffff, 3);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);

    // Sol
    const sunTexture = this.textureLoader.load('assets/textures/sun.jpg');
    const sunGeo = new THREE.SphereGeometry(6, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
    this.sun = new THREE.Mesh(sunGeo, sunMat);
    this.scene.add(this.sun);


    for (const data of this.planetData) {
      const mesh = this.addPlanet(data);

      //data.mesh = mesh;
    }
    //for (const planet of planetData) {
    //this.addPlanet(planet.name, planet.orbitRadius, planet.speed, planet.size, planet.texture);
    //this.drawOrbit(planet.orbitRadius);

    //}
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private addPlanet(data: any): THREE.Mesh {
    const texture = this.textureLoader.load(data.texture);
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);

    if (data.hasRings) {
      const ringGeometry = new THREE.RingGeometry(data.size * 1.2, data.size * 2.0, 60);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xbbaacc,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2.5;
      mesh.add(ring);
    }


    this.scene.add(mesh);

    const ambientLight = new THREE.AmbientLight(0x404040, 5); // luz suave
    this.scene.add(ambientLight);

    this.planets.push({
      name: data.name,
      mesh,
      orbitRadius: data.orbitRadius,
      speed: data.speed,
      angle: Math.random() * Math.PI * 2,
      info: data.info,
      texture: data.texture
    });

    this.drawOrbit(data.orbitRadius);
    return mesh;
  }

  /*private addPlanet(name: string, orbitRadius: number, speed: number, size: number, texturePath: string) {
    const texture = this.textureLoader.load(texturePath);
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    const ambientLight = new THREE.AmbientLight(0x404040, 5); // luz suave
  this.scene.add(ambientLight); 



    this.scene.add(mesh);

    this.planets.push({ name, mesh, orbitRadius, speed, angle: Math.random() * Math.PI * 2 });
  }*/



  private drawOrbit(radius: number) {
    const segments = 64;
    const material = new THREE.LineBasicMaterial({ color: 0x888888 });

    const geometry = new THREE.BufferGeometry();
    const points = [];

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }

    geometry.setFromPoints(points);
    const orbit = new THREE.LineLoop(geometry, material);
    this.scene.add(orbit);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    for (const planet of this.planets) {
      planet.angle += (planet.speed + this.orbitSpeed);
      if (planet.mesh) {
        planet.mesh.position.x = Math.cos(planet.angle) * planet.orbitRadius;
        planet.mesh.position.z = Math.sin(planet.angle) * planet.orbitRadius;
      }

    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public showPlanetInfo(planet: any) {
    this.selectedPlanet = planet;
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}