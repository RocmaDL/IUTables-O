async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth.php?action=isConnected', { credentials: 'include' });
        const result = await response.json();
        
        if (result.connected) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.add('d-none');
            });
            document.getElementById('profileLink').classList.remove('d-none');
        }
        console.log(result.user);
        return result.user;
    } catch (error) {
        console.error('Erreur:', error);
        return null;
    }
}

// Gestion de la déconnexion
document.querySelectorAll('#logoutLink').forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/auth.php?action=logout', { method: 'POST', credentials: 'include' });
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Erreur:', error);
        }
    });
});