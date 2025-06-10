import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ugznhwthaztruazsjbhu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnem5od3RoYXp0cnVhenNqYmh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjU4NjAsImV4cCI6MjA2NDA0MTg2MH0.MlBkk-oKSRW7CaUiFf3Edo0KXamVlLaZfLuxGcWL4yU';
const supabase = createClient(supabaseUrl, supabaseKey);

const taskList = document.getElementById('taskList');
const hiddenTaskList = document.getElementById('hiddenTaskList');
const taskForm = document.getElementById('taskForm');

async function renderTasks() {
    const { data: tasks, error } = await supabase.from('tasks').select('*');
    taskList.innerHTML = '';
    hiddenTaskList.innerHTML = '';
    if (error) return taskList.textContent = 'Błąd ładowania zadań.';

    tasks.forEach(task => {
        const div = document.createElement('div');
        div.classList.add('task');
        if (task.done) div.classList.add('done');

        const label = document.createElement('label');
        label.textContent = `${task.content} (Przypisani: ${task.assignees || ''})`;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edytuj';
        editBtn.onclick = async () => {
            const newContent = prompt('Nowa treść zadania:', task.content);
            const newAssignees = prompt('Nowi przypisani (oddzieleni średnikiem):', task.assignees || '');
            if (newContent && newAssignees !== null) {
                await supabase.from('tasks').update({ content: newContent, assignees: newAssignees }).eq('id', task.id);
                renderTasks();
            }
        };

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = task.visible === false ? 'Odkryj' : 'Ukryj';
        toggleBtn.onclick = async () => {
            await supabase.from('tasks').update({ visible: !task.visible }).eq('id', task.id);
            renderTasks();
        };

        div.appendChild(label);
        div.appendChild(editBtn);
        div.appendChild(toggleBtn);

        (task.visible === false ? hiddenTaskList : taskList).appendChild(div);
    });
}

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('taskInput').value.trim();
    const assignees = document.getElementById('assigneeInput').value.trim();
    if (!content) return alert('Wpisz treść zadania.');
    await supabase.from('tasks').insert([{ content, assignees, done: false, visible: true }]);
    taskForm.reset();
    renderTasks();
});

renderTasks();