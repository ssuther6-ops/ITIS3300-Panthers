document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const val = document.getElementById('searchInput').value;
            if(val) {
                document.getElementById('statusText').innerText = `Searching for "${val}"...`;
            }
        });
    }
});