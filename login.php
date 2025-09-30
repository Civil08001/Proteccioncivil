<?php
session_start();
if ($_POST) {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    if ($username === 'proteccion_civil' && $password === 'civil_miranda_2025') {
        $_SESSION['loggedin'] = true;
        header('Location: dashboard.php');
        exit;
    } else {
        $error = "Credenciales incorrectas";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Protección Civil Miranda</title>
    <script src="https://cdn.tailwindcss.com"></script>
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
<body class="bg-gradient-to-r from-[#0D47A1] to-[#F57C00] min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-[#0D47A1]">Protección Civil</h1>
            <p class="text-[#F57C00]">Estado Miranda</p>
        </div>
        
        <?php if (isset($error)): ?>
            <div class="bg-[#D32F2F] text-white p-3 rounded mb-4">
                <?php echo $error; ?>
            </div>
        <?php endif; ?>
        
        <form method="POST" class="space-y-6">
            <div>
                <label class="block text-gray-700 mb-2">Usuario</label>
                <input type="text" name="username" required 
                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D47A1]">
            </div>
            
            <div>
                <label class="block text-gray-700 mb-2">Contraseña</label>
                <input type="password" name="password" required 
                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D47A1]">
            </div>
            
            <button type="submit" 
                    class="w-full bg-[#F57C00] text-white py-2 rounded-lg hover:bg-[#E65100] transition duration-300">
                Iniciar Sesión
            </button>
        </form>
    </div>
</body>
</html>