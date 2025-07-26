// Drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
    const furnitureItems = document.querySelectorAll('.furniture-item');
    const canvasContainer = document.querySelector('.canvas-container');
    
    // Initialize drag and drop
    furnitureItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });
    
    canvasContainer.addEventListener('dragover', handleDragOver);
    canvasContainer.addEventListener('drop', handleDrop);
    
    // Drag start handler
    function handleDragStart(e) {
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', JSON.stringify({
            type: this.dataset.model,
            category: this.dataset.category
        }));
        
        // Set drag image (optional)
        if (e.dataTransfer.setDragImage) {
            const dragImage = document.createElement('div');
            dragImage.className = 'drag-image';
            dragImage.style.width = '100px';
            dragImage.style.height = '100px';
            dragImage.style.background = this.style.background;
            dragImage.style.opacity = '0.7';
            document.body.appendChild(dragImage);
            
            e.dataTransfer.setDragImage(dragImage, 50, 50);
            
            // Clean up after drag
            setTimeout(() => {
                document.body.removeChild(dragImage);
            }, 0);
        }
    }
    
    // Drag end handler
    function handleDragEnd() {
        this.classList.remove('dragging');
    }
    
    // Drag over handler
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }
    
    // Drop handler
    function handleDrop(e) {
        e.preventDefault();
        
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const rect = canvasContainer.getBoundingClientRect();
        
        // Calculate position in 3D space
        const x = (e.clientX - rect.left) / rect.width * 10 - 5;
        const z = (e.clientY - rect.top) / rect.height * 10 - 5;
        
        // Create furniture model
        const model = decorAR.addFurniture(data.type, { x, y: 0, z });
        
        // Select the new item
        decorAR.selectItem(model);
    }
});

// Canvas click handler for selection
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('decorar-canvas');
    
    canvas.addEventListener('click', function(e) {
        // Handle item selection
        // This is handled in the Three.js scene
    });
});

// Property controls
document.addEventListener('DOMContentLoaded', function() {
    const rotationSlider = document.getElementById('rotation');
    const scaleSlider = document.getElementById('scale');
    const applyPropertiesBtn = document.getElementById('apply-properties');
    
    rotationSlider.addEventListener('input', function() {
        document.getElementById('rotation-value').textContent = `${this.value}°`;
    });
    
    scaleSlider.addEventListener('input', function() {
        document.getElementById('scale-value').textContent = this.value;
    });
    
    applyPropertiesBtn.addEventListener('click', function() {
        if (decorAR.selectedItem) {
            // Apply rotation
            const rotationRad = rotationSlider.value * Math.PI / 180;
            decorAR.selectedItem.rotation.y = rotationRad;
            
            // Apply scale
            const scale = parseFloat(scaleSlider.value);
            decorAR.selectedItem.scale.set(scale, scale, scale);
            
            // Apply position
            const posX = parseFloat(document.getElementById('pos-x').value);
            const posY = parseFloat(document.getElementById('pos-y').value);
            const posZ = parseFloat(document.getElementById('pos-z').value);
            
            decorAR.selectedItem.position.set(posX, posY, posZ);
        }
    });
});

// Clear all button
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('clear-all').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all furniture items?')) {
            decorAR.clearAllItems();
        }
    });
});

// Apply texture button
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('apply-texture').addEventListener('click', function() {
        const fileInput = document.getElementById('room-image');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select an image file first.');
            return;
        }
        
        decorAR.applyRoomTexture(file)
            .then(() => {
                alert('Room texture applied successfully!');
            })
            .catch(error => {
                console.error('Error applying texture:', error);
                alert('Error applying texture. Please try another image.');
            });
    });
});

// Camera control buttons
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('zoom-in').addEventListener('click', function() {
        decorAR.zoomCamera(0.1);
    });
    
    document.getElementById('zoom-out').addEventListener('click', function() {
        decorAR.zoomCamera(-0.1);
    });
    
    document.getElementById('reset-view').addEventListener('click', function() {
        decorAR.resetCameraView();
    });
});

// Save design button
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('save-design').addEventListener('click', function() {
        // In a real app, this would save the scene state
        alert('Design saved! (This is a placeholder feature)');
    });
});