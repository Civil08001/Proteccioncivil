<?php
session_start();
if (!isset($_SESSION['loggedin'])) {
    header('Location: login.php');
    exit;
}

include 'config/database.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Protección Civil Miranda</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="css/styles.css">
     <!-- Favicon Configuration -->
    <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png">
    <link rel="icon" type="image/x-icon" href="assets/favicon.ico">
    <link rel="manifest" href="assets/site.webmanifest">
    <meta name="msapplication-TileColor" content="#0D47A1">
    <meta name="theme-color" content="#0D47A1">


</head>
<body class="bg-gray-100">
    <!-- Header -->
    <header class="bg-[#0D47A1] text-white p-4 shadow-lg">
    <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold">Protección Civil Miranda</h1>
            <span class="bg-[#FFEB3B] text-[#0D47A1] px-2 py-1 rounded text-sm font-semibold" id="connectionStatus">
                Online
            </span>
        </div>
        <!-- Cambiar el enlace directo por uno que vaya a la página de confirmación -->
        <a href="logout.php" class="bg-[#D32F2F] hover:bg-red-700 px-4 py-2 rounded transition duration-300">
            Cerrar Sesión
        </a>
    </div>
</header>

    <div class="container mx-auto p-4">
        <!-- Controles -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <!-- Panel de Control -->
            <div class="bg-white p-4 rounded-lg shadow col-span-1">
                <h2 class="text-xl font-bold text-[#0D47A1] mb-4">Panel de Control</h2>
                
                <button onclick="showAddUnitModal()" 
                        class="w-full bg-[#F57C00] text-white py-2 rounded mb-4 hover:bg-[#E65100] transition duration-300">
                    Agregar Unidad
                </button>
                
                <div class="space-y-2" id="unitsList">
                    <!-- Lista de unidades se cargará aquí -->
                </div>
            </div>

            <!-- Mapa -->
            <div class="bg-white p-4 rounded-lg shadow col-span-1 lg:col-span-3">
                <div id="map" class="h-96 lg:h-[600px] rounded"></div>
            </div>
        </div>

        <!-- Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded-lg shadow text-center">
                <h3 class="text-lg font-semibold text-[#0D47A1]">Total Unidades</h3>
                <p class="text-3xl font-bold text-[#F57C00]" id="totalUnits">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow text-center">
                <h3 class="text-lg font-semibold text-[#0D47A1]">En Base</h3>
                <p class="text-3xl font-bold text-green-600" id="unitsInBase">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow text-center">
                <h3 class="text-lg font-semibold text-[#0D47A1]">En Ruta</h3>
                <p class="text-3xl font-bold text-[#FFEB3B]" id="unitsEnRoute">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow text-center">
                <h3 class="text-lg font-semibold text-[#0D47A1]">En Emergencia</h3>
                <p class="text-3xl font-bold text-[#D32F2F]" id="unitsInEmergency">0</p>
            </div>
        </div>
    </div>

   <!-- Modal para agregar/editar unidad -->
<div id="unitModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-[1000]">
    <div class="bg-white p-6 rounded-lg w-full max-w-4xl mx-4 relative max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Botón X para cerrar -->
        <button onclick="hideModal()" class="absolute top-4 right-4 text-[#0D47A1] hover:text-blue-700 text-xl font-bold z-10">
            ✕
        </button>
        
        <h2 class="text-xl font-bold text-[#0D47A1] mb-4" id="modalTitle">Agregar Unidad</h2>
        
        <!-- Pestañas -->
        <div class="flex border-b mb-4">
            <button id="tabInfo" onclick="switchTab('info')" class="px-4 py-2 font-medium border-b-2 border-[#0D47A1] text-[#0D47A1]">
                Información
            </button>
            <button id="tabLocation" onclick="switchTab('location')" class="px-4 py-2 font-medium text-gray-500 hover:text-[#0D47A1]">
                Ubicación
            </button>
        </div>
        
        <form id="unitForm" class="flex-1 overflow-hidden" novalidate>
            <input type="hidden" id="unitId">
            <input type="hidden" id="unitLat">
            <input type="hidden" id="unitLng">
            
            <!-- Pestaña Información -->
            <div id="tabInfoContent" class="tab-content space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-700 mb-2 required-field">Placa</label>
                        <input type="text" id="placa" required 
                               class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0D47A1]">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2 required-field">Tipo de Unidad</label>
                        <select id="tipo_unidad" required 
                                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0D47A1]">
                            <option value="">Seleccionar...</option>
                            <option value="Ambulancia">Ambulancia</option>
                            <option value="Rescate">Unidad de Rescate</option>
                            <option value="Bomberos">Bomberos</option>
                            <option value="Comando">Comando</option>
                            <option value="Logística">Logística</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2 required-field">Encargado</label>
                    <input type="text" id="encargado" required 
                           class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0D47A1]">
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2">Tripulantes</label>
                    <textarea id="tripulantes" rows="3" 
                              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0D47A1]"
                              placeholder="Nombres de tripulantes separados por coma"></textarea>
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2">Estado</label>
                    <select id="estado" 
                            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0D47A1]">
                        <option value="base">En Base</option>
                        <option value="ruta">En Ruta</option>
                        <option value="emergencia">En Emergencia</option>
                    </select>
                </div>
            </div>
            
            <!-- Pestaña Ubicación -->
            <div id="tabLocationContent" class="tab-content hidden">
                <div class="mb-4">
                    <p class="text-gray-600 mb-2">Haz clic en el mapa para marcar la ubicación de la unidad:</p>
                    <div class="flex items-center space-x-4 text-sm">
                        <div class="flex items-center">
                            <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span>Ubicación actual</span>
                        </div>
                        <div id="coordinates" class="text-[#0D47A1] font-mono bg-gray-100 px-2 py-1 rounded">
                            Lat: --, Lng: --
                        </div>
                    </div>
                </div>
                <div id="modalMap" class="h-64 rounded-lg border-2 border-gray-300"></div>
                
                <!-- Mensaje informativo -->
                <div class="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
                    <p class="text-blue-800 text-sm">
                        <strong>Nota:</strong> La ubicación en el mapa es opcional. Si no marca una ubicación, 
                        la unidad aparecerá en la lista pero no se mostrará en el mapa.
                    </p>
                </div>
            </div>
            
            <div class="flex space-x-2 mt-6 pt-4 border-t">
                <button type="button" onclick="previousTab()" id="prevBtn" class="hidden px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300">
                    Anterior
                </button>
                <button type="button" onclick="nextTab()" id="nextBtn" class="px-4 py-2 bg-[#0D47A1] text-white rounded hover:bg-blue-700 transition duration-300">
                    Siguiente
                </button>
                <button type="button" id="submitBtn" class="hidden flex-1 bg-[#F57C00] text-white py-2 rounded hover:bg-[#E65100] transition duration-300">
                    Guardar Unidad
                </button>
                <button type="button" onclick="hideModal()" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300">
                    Cancelar
                </button>
            </div>
        </form>
    </div>
</div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="js/app.js"></script>
</body>
</html>