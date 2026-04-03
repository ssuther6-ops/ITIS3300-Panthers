document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const val = document.getElementById('searchInput').value;
            if(val) {
                document.getElementById('statusText').innerText = `Searching for "${val}"...`;
            } else {
                alert("Please enter a book title or author.");
            }
        });
    }
});