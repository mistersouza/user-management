let isEditMode = false;

const getButtons = () => ({
    deleteBtn: document.querySelector('#deleteBtn'),
    editBtn: document.querySelector('#editBtn'),
    fieldEditButtons: document.querySelectorAll('.field-edit-button')
});

const handleButtonClasses = (button, ...classes) => {
    classes.length > 1
    ? button.classList.replace(...classes)
    : button.classList.toggle(classes.at(0));
};

const deleteUser = () => {
    const { deleteBtn, editBtn } = getButtons();
    
    deleteBtn.innerHTML = 'Trash it<i class="bi bi-exclamation-lg"></i>';
    handleButtonClasses(deleteBtn, 'btn-secondary', 'btn-danger');
    editBtn.innerHTML = 'Back Out';
    handleButtonClasses(editBtn, 'btn-outline-secondary', 'btn-outline-success');
    
    deleteBtn.onclick = () => deleteBtn.closest('form').submit();;
    editBtn.onclick = () => resetButtons();
};

const resetButtons = () => {
    const { deleteBtn, editBtn } = getButtons();
    
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    handleButtonClasses(deleteBtn, 'btn-danger', 'btn-secondary');
    editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
    handleButtonClasses(editBtn, 'btn-outline-success', 'btn-outline-secondary');
    
    deleteBtn.onclick = deleteUser;
    editBtn.onclick = editUser;
};

const createInput = (value) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.className = 'form-control form-control-sm d-inline-block';
    input.style.minWidth = '100px';
    input.style.maxWidth = `${value.length + 2}ch`;
    return input;
};

const updateSpan = (input, span) => {
    span.textContent = input.value;
    input.replaceWith(span);
};

handleFieldEditClick = (button) => {
    const field = button.dataset.field;

    if (field === 'name') {
        const spans = document.querySelectorAll('.name');
        
        if (spans.length) {
            const elements = [...spans].map(span => {
                const input = createInput(span.textContent.trim());
                input.id = span.id;
                span.replaceWith(input);
                return { input, span };
            });

            elements[0].input.focus();
            
            elements.forEach(({ input, span }) => {
                input.addEventListener('blur', () => {
                    setTimeout(() => {
                        const activeId = document.activeElement.id;
                        if (!activeId || !['firstName', 'lastName'].includes(activeId)) {
                            elements.forEach(({ input, span }) => updateSpan(input, span));
                        }
                    }, 0);
                });
            });
        }
        return;
    }

    const span = button.previousElementSibling;
    const currentValue = span.textContent.trim();
    
    const input = createInput(currentValue);
    input.type = field === 'email' ? 'email' : 'text';
    
    span.replaceWith(input);
    input.focus();
    
    input.addEventListener('blur', () => updateSpan(input, span));
};

const editUser = () => {
    const { deleteBtn, editBtn, fieldEditButtons } = getButtons();

    fieldEditButtons.forEach(button => {
        handleButtonClasses(button, 'd-none');
        button.onclick = () => handleFieldEditClick(button);
    });

    isEditMode = !isEditMode;

    if (!isEditMode) {
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        handleButtonClasses(deleteBtn, 'btn-success');
    } else {
        editBtn.textContent = 'Nevermind';
        deleteBtn.textContent = 'Sync-Up';
        handleButtonClasses(deleteBtn, 'btn-success');
    }
};