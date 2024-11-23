const deleteUser = (id) => {
    const deleteBtn = document.querySelector('#deleteBtn');
    const editBtn = document.querySelector('#editBtn');
    
    deleteBtn.innerHTML = 'Trash it<i class="bi bi-exclamation-lg"></i>';
    deleteBtn.classList.replace('btn-secondary', 'btn-danger');
    editBtn.innerHTML = 'Back Out';
    editBtn.classList.replace('btn-outline-secondary', 'btn-outline-success');
    
    deleteBtn.onclick = () => deleteBtn.closest('form').submit();;

    editBtn.onclick = (e) => {
        e.preventDefault();
        resetButtons();
    }
};

const resetButtons = () => {
    const deleteBtn = document.querySelector('#deleteBtn');
    const editBtn = document.querySelector('#editBtn');
    
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.classList.replace('btn-danger', 'btn-secondary');
    editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
    editBtn.classList.replace('btn-outline-success', 'btn-outline-secondary');
    
    deleteBtn.onclick = deleteUser;
    editBtn.onclick = null;
    editBtn.href = `/users/edit/{{user.id}}`;
}

const handleIconClick = (icon) => {
    const field = icon.dataset.field;
    const span = icon.previousElementSibling;
    const currentValue = span.textContent.trim();
    
    const input = document.createElement('input');
    input.type = field === 'email' ? 'email' : 'text';
    input.value = currentValue;
    input.className = 'form-control form-control-sm d-inline-block';
    input.style.minWidth = '100px';
    input.style.maxWidth = `${currentValue.length + 2}ch`;
    
    span.replaceWith(input);
    input.focus();
    
    input.addEventListener('blur', () => {
        span.textContent = input.value;
        input.replaceWith(span)
    });
};

document.querySelectorAll('.edit-icon').forEach(icon => {
    icon.addEventListener('click', () => handleIconClick(icon));
});

let isEditMode = false;

const editUser = () => {
    const icons = document.querySelectorAll('.edit-icon');
    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    icons.forEach(icon => {
        icon.classList.toggle('d-none')
        icon.addEventListener('click', () => handleIconClick(icon));
    });

    isEditMode = !isEditMode;

    if (!isEditMode) {
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.classList.toggle('btn-success');
    } else {
        editBtn.textContent = 'Nevermind';
        deleteBtn.textContent = 'Sync-Up';
        deleteBtn.classList.toggle('btn-success');
    }
};