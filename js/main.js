// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Three.js scene
    initThreeJS();
    
    // Initialize drag and drop functionality
    initDragAndDrop();
    
    // Event listeners for buttons
    document.getElementById('clear-all').addEventListener('click', clearAllItems);
    document.getElementById('apply-texture').addEventListener('click', applyRoomTexture);
    document.getElementById('save-design').addEventListener('click', saveDesign);
    
    // Category filtering
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', filterFurniture);
    });
    
    // Canvas control buttons
    document.getElementById('zoom-in').addEventListener('click', () => zoomCamera(0.1));
    document.getElementById('zoom-out').addEventListener('click', () => zoomCamera(-0.1));
    document.getElementById('reset-view').addEventListener('click', resetCameraView);
    
    // Property controls
    document.getElementById('apply-properties').addEventListener('click', applyProperties);
    document.getElementById('rotation').addEventListener('input', updateRotationValue);
    document.getElementById('scale').addEventListener('input', updateScaleValue);
});

// Three.js initialization
function initThreeJS() {
    const canvas = document.getElementById('decorar-canvas');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xeeeeee,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
    
    // Store references
    window.threejs = {
        scene,
        camera,
        renderer,
        controls,
        floor
    };
}

// Drag and drop functionality
function initDragAndDrop() {
    const furnitureItems = document.querySelectorAll('.furniture-item');
    const canvasContainer = document.querySelector('.canvas-container');
    
    furnitureItems.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: this.dataset.model,
                category: this.dataset.category
            }));
        });
    });
    
    canvasContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    canvasContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const rect = canvasContainer.getBoundingClientRect();
        
        // Calculate position in 3D space (simplified)
        const x = (e.clientX - rect.left) / rect.width * 10 - 5;
        const z = (e.clientY - rect.top) / rect.height * 10 - 5;
        
        // Create furniture model (placeholder)
        createFurnitureModel(data.type, { x, y: 0, z });
    });
}

// Create furniture model (placeholder implementation)
function createFurnitureModel(type, position) {
    const scene = window.threejs.scene;
    
    // Create a simple geometry based on type
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
    model.userData = { type, isPlaced: true };
    
    scene.add(model);
    
    // Add to placed items array
    window.placedItems = window.placedItems || [];
    window.placedItems.push({
        id: Date.now(),
        type,
        model,
        position
    });
}

// Clear all furniture items
function clearAllItems() {
    const scene = window.threejs.scene;
    
    // Remove all placed items
    if (window.placedItems) {
        window.placedItems.forEach(item => {
            scene.remove(item.model);
        });
        window.placedItems = [];
    }
}

// Apply room texture
function applyRoomTexture() {
    const fileInput = document.getElementById('room-image');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select an image file first.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(e.target.result);
        
        // Apply to floor
        const floor = window.threejs.floor;
        floor.material.map = texture;
        floor.material.needsUpdate = true;
    };
    reader.readAsDataURL(file);
}

// Save design (placeholder)
function saveDesign() {
    // In a real app, this would save the scene state
    alert('Design saved! (This is a placeholder feature)');
}

// Filter furniture by category
function filterFurniture(e) {
    const category = e.target.dataset.category;
    const items = document.querySelectorAll('.furniture-item');
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Filter items
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Camera controls
function zoomCamera(delta) {
    const camera = window.threejs.camera;
    camera.position.z = Math.max(5, Math.min(15, camera.position.z - delta * 5));
}

function resetCameraView() {
    const camera = window.threejs.camera;
    const controls = window.threejs.controls;
    
    camera.position.set(0, 5, 10);
    controls.target.set(0, 0, 0);
    controls.update();
}

// Property controls
function updateRotationValue(e) {
    document.getElementById('rotation-value').textContent = `${e.target.value}°`;
}

function updateScaleValue(e) {
    document.getElementById('scale-value').textContent = e.target.value;
}

function applyProperties() {
    // This would apply property changes to the selected item
    alert('Properties applied! (This is a placeholder feature)');
}

// Initialize global variables
window.placedItems = [];