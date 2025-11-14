<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>SFPMS - Student & Faculty Profile Management System</title>
    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
</head>
<body>
    <div id="root"></div>
    <script>
        // Quick debug marker: will be replaced by React if everything mounts correctly
        try {
            document.getElementById('root').innerHTML = '<div id="debug-js-loaded" style="position:fixed;right:8px;bottom:8px;background:#0b0;color:#fff;padding:6px 8px;border-radius:4px;z-index:9999">JS loaded</div>';
        } catch (e) {
            // ignore
        }
        // Report unhandled errors to the server for debugging
        window.addEventListener('error', function (e) {
            try {
                fetch('/__client-error', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': '{{ csrf_token() }}' },
                    body: JSON.stringify({ message: e.message, stack: e.error?.stack || null })
                });
            } catch (err) {
                // ignore
            }
        });
    </script>
    <script src="{{ mix('js/app.js') }}"></script>
</body>
</html>
