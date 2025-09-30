<?php
session_start();

// Verificar si se confirmó el cierre de sesión
if (isset($_GET['confirm']) && $_GET['confirm'] === 'true') {
    session_destroy();
    header('Location: login.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cerrar Sesión - Protección Civil Miranda</title>
    
    <!-- Favicon Configuration -->
    <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png">
    <link rel="icon" type="image/x-icon" href="assets/favicon.ico">
    <link rel="manifest" href="assets/site.webmanifest">
    <meta name="msapplication-TileColor" content="#0D47A1">
    <meta name="theme-color" content="#0D47A1">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="css/styles.css">
    
    <script>
        // Mostrar confirmación al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            const confirmed = confirm('¿Está seguro que desea cerrar sesión?');
            
            if (confirmed) {
                // Redirigir para cerrar sesión
                window.location.href = 'logout.php?confirm=true';
            } else {
                // Regresar al dashboard
                window.location.href = 'dashboard.php';
            }
        });
    </script>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="bg-white p-8 rounded-lg shadow-lg text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D47A1] mx-auto mb-4"></div>
        <p class="text-gray-600">Procesando...</p>
    </div>
</body>
</html>