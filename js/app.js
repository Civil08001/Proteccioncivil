// Variables globales
let map;
let units = [];
let markers = [];
let isOnline = true;

// Variables para el mapa del modal
let modalMap;
let locationMarker;
let currentTab = 'info';

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadUnits();
    setupServiceWorker();
    setupConnectionMonitoring();
    
    // Configurar el formulario
    document.getElementById('unitForm').addEventListener('submit', handleFormSubmit);
    
    // Configurar el botón de guardar
    document.getElementById('submitBtn').addEventListener('click', handleSaveUnit);
});

// Inicializar el mapa de Miranda
function initializeMap() {
    // Coordenadas centrales del estado Miranda
    map = L.map('map').setView([10.251, -66.415], 10);
    
    // Capa base del mapa (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
}

// Cargar unidades desde el servidor
async function loadUnits() {
    try {
        const response = await fetch('api/get_units.php');
        units = await response.json();
        updateUnitsDisplay();
        updateMapMarkers();
        updateStatistics();
        
        // Guardar en localStorage para modo offline
        localStorage.setItem('units_cache', JSON.stringify(units));
        localStorage.setItem('units_cache_timestamp', new Date().getTime());
    } catch (error) {
        console.error('Error cargando unidades:', error);
        loadUnitsFromCache();
    }
}

// Cargar unidades desde cache
function loadUnitsFromCache() {
    const cached = localStorage.getItem('units_cache');
    if (cached) {
        units = JSON.parse(cached);
        updateUnitsDisplay();
        updateMapMarkers();
        updateStatistics();
    }
}

// Actualizar la lista de unidades en el panel
function updateUnitsDisplay() {
    const container = document.getElementById('unitsList');
    container.innerHTML = '';
    
    units.forEach(unit => {
        const unitElement = document.createElement('div');
        unitElement.className = 'bg-gray-50 p-3 rounded border';
        unitElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold text-[#0D47A1]">${unit.placa}</h4>
                    <p class="text-sm text-gray-600">${unit.tipo_unidad}</p>
                    <p class="text-xs text-gray-500">Encargado: ${unit.encargado}</p>
                    <span class="inline-block px-2 py-1 text-xs rounded mt-1 ${
                        unit.estado === 'base' ? 'bg-green-100 text-green-800' :
                        unit.estado === 'ruta' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }">
                        ${getEstadoText(unit.estado)}
                    </span>
                </div>
                <div class="flex space-x-1">
                    <button onclick="editUnit(${unit.id})" class="text-[#0D47A1] hover:text-blue-700">
                        ✏️
                    </button>
                    <button onclick="deleteUnit(${unit.id})" class="text-[#D32F2F] hover:text-red-700">
                        🗑️
                    </button>
                </div>
            </div>
        `;
        container.appendChild(unitElement);
    });
}

// Actualizar marcadores en el mapa
function updateMapMarkers() {
    // Limpiar marcadores existentes
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    units.forEach(unit => {
        if (unit.lat && unit.lng) {
            const marker = L.marker([unit.lat, unit.lng])
                .addTo(map)
                .bindPopup(`
                    <div class="p-2">
                        <h4 class="font-bold text-[#0D47A1]">${unit.placa}</h4>
                        <p><strong>Tipo:</strong> ${unit.tipo_unidad}</p>
                        <p><strong>Encargado:</strong> ${unit.encargado}</p>
                        <p><strong>Estado:</strong> ${getEstadoText(unit.estado)}</p>
                        <p><strong>Tripulantes:</strong> ${unit.tripulantes}</p>
                        <div class="mt-2 space-x-1">
                            <button onclick="editUnit(${unit.id})" class="bg-[#0D47A1] text-white px-2 py-1 rounded text-xs">
                                Editar
                            </button>
                            <button onclick="deleteUnit(${unit.id})" class="bg-[#D32F2F] text-white px-2 py-1 rounded text-xs">
                                Eliminar
                            </button>
                        </div>
                    </div>
                `);
            
            // Personalizar icono según estado
            const icon = L.divIcon({
                className: `unit-marker-${unit.estado} w-6 h-6 rounded-full shadow-lg`,
                html: '🚑',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            marker.setIcon(icon);
            
            markers.push(marker);
        }
    });
}

// Actualizar estadísticas
function updateStatistics() {
    document.getElementById('totalUnits').textContent = units.length;
    document.getElementById('unitsInBase').textContent = units.filter(u => u.estado === 'base').length;
    document.getElementById('unitsEnRoute').textContent = units.filter(u => u.estado === 'ruta').length;
    document.getElementById('unitsInEmergency').textContent = units.filter(u => u.estado === 'emergencia').length;
}

// Funciones para las pestañas
function switchTab(tabName) {
    currentTab = tabName;
    
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remover estilo activo de todas las pestañas
    document.querySelectorAll('[id^="tab"]').forEach(tabBtn => {
        tabBtn.classList.remove('border-[#0D47A1]', 'text-[#0D47A1]');
        tabBtn.classList.add('text-gray-500');
    });
    
    // Mostrar contenido de la pestaña seleccionada
    document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Content`).classList.remove('hidden');
    
    // Activar pestaña seleccionada
    document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('border-[#0D47A1]', 'text-[#0D47A1]');
    document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.remove('text-gray-500');
    
    // Controlar botones de navegación
    updateNavigationButtons();
    
    // Inicializar mapa si es la pestaña de ubicación
    if (tabName === 'location' && !modalMap) {
        initializeModalMap();
    }
}

function nextTab() {
    if (currentTab === 'info') {
        switchTab('location');
    }
}

function previousTab() {
    if (currentTab === 'location') {
        switchTab('info');
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (currentTab === 'info') {
        prevBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    } else if (currentTab === 'location') {
        prevBtn.classList.remove('hidden');
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    }
}

// Inicializar mapa en el modal
function initializeModalMap() {
    // Usar coordenadas existentes o coordenadas por defecto de Miranda
    const currentLat = document.getElementById('unitLat').value || 10.251;
    const currentLng = document.getElementById('unitLng').value || -66.415;
    
    modalMap = L.map('modalMap').setView([currentLat, currentLng], 13);
    
    // Capa base del mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(modalMap);
    
    // Agregar marcador si hay coordenadas
    if (document.getElementById('unitLat').value && document.getElementById('unitLng').value) {
        locationMarker = L.marker([currentLat, currentLng], {
            draggable: true
        }).addTo(modalMap);
        
        updateCoordinatesDisplay(currentLat, currentLng);
    }
    
    // Evento para hacer clic en el mapa
    modalMap.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        // Actualizar campos ocultos
        document.getElementById('unitLat').value = lat;
        document.getElementById('unitLng').value = lng;
        
        // Agregar o mover marcador
        if (locationMarker) {
            locationMarker.setLatLng([lat, lng]);
        } else {
            locationMarker = L.marker([lat, lng], {
                draggable: true
            }).addTo(modalMap);
            
            // Evento para arrastrar marcador
            locationMarker.on('dragend', function(e) {
                const marker = e.target;
                const position = marker.getLatLng();
                document.getElementById('unitLat').value = position.lat;
                document.getElementById('unitLng').value = position.lng;
                updateCoordinatesDisplay(position.lat, position.lng);
            });
        }
        
        updateCoordinatesDisplay(lat, lng);
        
        // Centrar mapa en la ubicación seleccionada
        modalMap.setView([lat, lng], modalMap.getZoom());
    });
}

// Actualizar display de coordenadas
function updateCoordinatesDisplay(lat, lng) {
    document.getElementById('coordinates').textContent = 
        `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
}

// Mostrar modal para agregar unidad
function showAddUnitModal() {
    document.getElementById('modalTitle').textContent = 'Agregar Unidad';
    document.getElementById('unitId').value = '';
    document.getElementById('unitForm').reset();
    document.getElementById('unitLat').value = '';
    document.getElementById('unitLng').value = '';
    document.getElementById('estado').value = 'base';
    
    // Resetear pestañas
    switchTab('info');
    
    // Mostrar modal
    const modal = document.getElementById('unitModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Limpiar mapa modal si existe
    if (modalMap) {
        modalMap.remove();
        modalMap = null;
        locationMarker = null;
    }
    
    // Deshabilitar interacción con el mapa principal
    map.dragging.disable();
    map.scrollWheelZoom.disable();
}

// Editar unidad
function editUnit(id) {
    const unit = units.find(u => u.id == id);
    if (unit) {
        document.getElementById('modalTitle').textContent = 'Editar Unidad';
        document.getElementById('unitId').value = unit.id;
        document.getElementById('placa').value = unit.placa;
        document.getElementById('tipo_unidad').value = unit.tipo_unidad;
        document.getElementById('encargado').value = unit.encargado;
        document.getElementById('tripulantes').value = unit.tripulantes;
        document.getElementById('estado').value = unit.estado;
        document.getElementById('unitLat').value = unit.lat || '';
        document.getElementById('unitLng').value = unit.lng || '';
        
        // Resetear a pestaña info
        switchTab('info');
        
        // Mostrar modal
        const modal = document.getElementById('unitModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Limpiar mapa modal si existe
        if (modalMap) {
            modalMap.remove();
            modalMap = null;
            locationMarker = null;
        }
        
        // Deshabilitar interacción con el mapa principal
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        
        // Si tiene coordenadas, actualizar display
        if (unit.lat && unit.lng) {
            updateCoordinatesDisplay(unit.lat, unit.lng);
        }
    }
}

// Ocultar modal
function hideModal() {
    const modal = document.getElementById('unitModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    // Limpiar mapa modal
    if (modalMap) {
        modalMap.remove();
        modalMap = null;
        locationMarker = null;
    }
    
    // Rehabilitar interacción con el mapa principal
    map.dragging.enable();
    map.scrollWheelZoom.enable();
}

// Manejar envío del formulario
function handleFormSubmit(e) {
    e.preventDefault();
    // Prevenir el envío automático, manejaremos todo con handleSaveUnit
}

// Manejar guardado de unidad
async function handleSaveUnit() {
    // Validación manual
    const placa = document.getElementById('placa').value.trim();
    const tipoUnidad = document.getElementById('tipo_unidad').value;
    const encargado = document.getElementById('encargado').value.trim();
    
    if (!placa) {
        alert('Por favor ingrese la placa de la unidad');
        document.getElementById('placa').focus();
        return;
    }
    
    if (!tipoUnidad) {
        alert('Por favor seleccione el tipo de unidad');
        switchTab('info');
        setTimeout(() => document.getElementById('tipo_unidad').focus(), 300);
        return;
    }
    
    if (!encargado) {
        alert('Por favor ingrese el nombre del encargado');
        switchTab('info');
        setTimeout(() => document.getElementById('encargado').focus(), 300);
        return;
    }
    
    const formData = new FormData();
    formData.append('id', document.getElementById('unitId').value);
    formData.append('placa', placa);
    formData.append('tipo_unidad', tipoUnidad);
    formData.append('encargado', encargado);
    formData.append('tripulantes', document.getElementById('tripulantes').value);
    formData.append('estado', document.getElementById('estado').value);
    formData.append('unitLat', document.getElementById('unitLat').value);
    formData.append('unitLng', document.getElementById('unitLng').value);
    
    try {
        // Mostrar loading
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Guardando...';
        submitBtn.disabled = true;
        
        const response = await fetch('api/save_unit.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (result.success) {
            hideModal();
            loadUnits();
            
            // Si estamos offline, guardar en cola de sincronización
            if (!isOnline) {
                saveToSyncQueue('save_unit', formData);
            }
            
            // Mostrar mensaje de éxito
            showNotification('Unidad guardada exitosamente', 'success');
        } else {
            alert('Error guardando unidad: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        // Guardar en cola de sincronización para cuando vuelva la conexión
        saveToSyncQueue('save_unit', formData);
        showNotification('Unidad guardada localmente. Se sincronizará cuando haya conexión.', 'warning');
        hideModal();
        loadUnitsFromCache();
    }
}

// Eliminar unidad
async function deleteUnit(id) {
    if (!confirm('¿Está seguro de eliminar esta unidad?')) return;
    
    try {
        const response = await fetch('api/delete_unit.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadUnits();
            
            // Si estamos offline, guardar en cola de sincronización
            if (!isOnline) {
                saveToSyncQueue('delete_unit', { id: id });
            }
        } else {
            alert('Error eliminando unidad: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        // Guardar en cola de sincronización
        saveToSyncQueue('delete_unit', { id: id });
        alert('Unidad eliminada localmente. Se sincronizará cuando haya conexión.');
        loadUnitsFromCache();
    }
}

// Guardar en cola de sincronización
function saveToSyncQueue(action, data) {
    const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
    queue.push({
        action: action,
        data: Object.fromEntries(data),
        timestamp: new Date().getTime()
    });
    localStorage.setItem('sync_queue', JSON.stringify(queue));
}

// Sincronizar cola cuando vuelva la conexión
async function syncQueue() {
    const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
    
    for (const item of queue) {
        try {
            if (item.action === 'save_unit') {
                await fetch('api/save_unit.php', {
                    method: 'POST',
                    body: new URLSearchParams(item.data)
                });
            } else if (item.action === 'delete_unit') {
                await fetch('api/delete_unit.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(item.data)
                });
            }
        } catch (error) {
            console.error('Error sincronizando:', error);
            break; // Detener si hay error
        }
    }
    
    // Limpiar cola procesada
    localStorage.setItem('sync_queue', JSON.stringify([]));
    loadUnits(); // Recargar datos actualizados
}

// Monitorear conexión
function setupConnectionMonitoring() {
    window.addEventListener('online', function() {
        isOnline = true;
        document.getElementById('connectionStatus').textContent = 'Online';
        document.getElementById('connectionStatus').classList.remove('connection-offline');
        document.getElementById('connectionStatus').classList.remove('bg-[#D32F2F]');
        document.getElementById('connectionStatus').classList.add('bg-green-600');
        
        // Sincronizar cuando vuelva la conexión
        syncQueue();
    });
    
    window.addEventListener('offline', function() {
        isOnline = false;
        document.getElementById('connectionStatus').textContent = 'Offline';
        document.getElementById('connectionStatus').classList.add('connection-offline');
        document.getElementById('connectionStatus').classList.remove('bg-green-600');
    });
}

// Configurar Service Worker
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/js/service-worker.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'warning' ? 'bg-yellow-500' : 
                   type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-[1001] transition-all duration-300 transform translate-x-full`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Helper functions
function getEstadoText(estado) {
    const estados = {
        'base': 'En Base',
        'ruta': 'En Ruta',
        'emergencia': 'En Emergencia'
    };
    return estados[estado] || estado;
}

// Cerrar modal con Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideModal();
    }
});

// Cerrar modal haciendo click fuera del contenido
document.getElementById('unitModal').addEventListener('click', function(e) {
    if (e.target === this) {
        hideModal();
    }
});