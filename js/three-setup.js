// Three.js setup and utilities
class DecorARScene {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.floor = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.placedItems = [];
        
        this.init();
    }
    
    init() {
        // Scene setup
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.canvas.clientWidth / this.canvas.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 5, 10);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);
        
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xeeeeee,
            roughness: 0.8,
            metalness: 0.2
        });
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Event listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
        
        // Animation loop
        this.animate();
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }
    
    onCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for intersections with placed items
        const intersects = this.raycaster.intersectObjects(
            this.scene.children.filter(child => child.userData.isPlaced)
        );
        
        if (intersects.length > 0) {
            // Item selected
            this.selectItem(intersects[0].object);
        } else {
            // No item selected
            this.deselectItem();
        }
    }
    
    selectItem(item) {
        // Deselect previous item
        this.deselectItem();
        
        // Select new item
        item.material.emissive = new THREE.Color(0x555555);
        item.material.emissiveIntensity = 0.2;
        
        // Show properties panel
        document.getElementById('no-selection').style.display = 'none';
        document.getElementById('item-properties').style.display = 'block';
        
        // Update position inputs
        document.getElementById('pos-x').value = item.position.x.toFixed(2);
        document.getElementById('pos-y').value = item.position.y.toFixed(2);
        document.getElementById('pos-z').value = item.position.z.toFixed(2);
        
        // Update rotation input
        const rotationDegrees = (item.rotation.y * 180 / Math.PI) % 360;
        document.getElementById('rotation').value = rotationDegrees;
        document.getElementById('rotation-value').textContent = `${Math.round(rotationDegrees)}°`;
        
        // Update scale input
        const scale = item.scale.x;
        document.getElementById('scale').value = scale;
        document.getElementById('scale-value').textContent = scale.toFixed(1);
        
        // Store selected item
        this.selectedItem = item;
    }
    
    deselectItem() {
        if (this.selectedItem) {
            // Reset material
            this.selectedItem.material.emissive = new THREE.Color(0x000000);
            this.selectedItem.material.emissiveIntensity = 0;
            
            // Hide properties panel
            document.getElementById('no-selection').style.display = 'block';
            document.getElementById('item-properties').style.display = 'none';
            
            // Clear selected item
            this.selectedItem = null;
        }
    }
    
    addFurniture(type, position) {
        // Create furniture model based on type
        let geometry;
        let color;
        
        switch(type) {
            case 'sofa':
                geometry = new THREE.BoxGeometry(4, 1, 2);
                color = 0x4a6da7;
                break;
            case 'armchair':
                geometry = new THREE.BoxGeometry(2, 1, 2);
                color = 0x4a6da7;
                break;
            case 'coffee-table':
                geometry = new THREE.BoxGeometry(3, 0.5, 1.5);
                color = 0x8B4513;
                break;
            case 'dining-table':
                geometry = new THREE.BoxGeometry(4, 0.7, 2.5);
                color = 0x8B4513;
                break;
            case 'floor-lamp':
                geometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 16);
                color = 0x333333;
                break;
            case 'ceiling-light':
                geometry = new THREE.SphereGeometry(0.5, 16, 16);
                color = 0xffffcc;
                break;
            case 'bookshelf':
                geometry = new THREE.BoxGeometry(3, 3, 0.5);
                color = 0x8B4513;
                break;
            case 'tv-stand':
                geometry = new THREE.BoxGeometry(4, 1, 1.5);
                color = 0x8B4513;
                break;
            default:
                geometry = new THREE.BoxGeometry(2, 1, 2);
                color = 0x4a6da7;
        }
        
        const material = new THREE.MeshStandardMaterial({ color });
        const model = new THREE.Mesh(geometry, material);
        
        model.position.set(position.x, position.y, position.z);
        model.userData = { 
            type, 
            isPlaced: true,
            id: Date.now()
        };
        
        this.scene.add(model);
        this.placedItems.push(model);
        
        return model;
    }
    
    clearAllItems() {
        // Remove all placed items
        this.placedItems.forEach(item => {
            this.scene.remove(item);
        });
        this.placedItems = [];
        this.deselectItem();
    }
    
    applyRoomTexture(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const textureLoader = new THREE.TextureLoader();
                const texture = textureLoader.load(e.target.result);
                
                // Apply to floor
                const floor = this.floor;
                floor.material.map = texture;
                floor.material.needsUpdate = true;
                
                resolve();
            }.bind(this);
            reader.readAsDataURL(file);
        });
    }
    
    zoomCamera(delta) {
        this.camera.position.z = Math.max(5, Math.min(15, this.camera.position.z - delta * 5));
    }
    
    resetCameraView() {
        this.camera.position.set(0, 5, 10);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
    
    getPlacedItems() {
        return this.placedItems;
    }
}

// Initialize the scene
let decorAR;

document.addEventListener('DOMContentLoaded', function() {
    decorAR = new DecorARScene('decorar-canvas');
});