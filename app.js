// LocalStorage キー定義
const STORAGE_KEY = 'todoAppTasks';

// 初期化時のサンプルタスク
const DEFAULT_TASKS = [
  { id: 1, text: 'HTML/CSSでTODOアプリの見た目を作成', completed: true },
  { id: 2, text: 'JavaScriptで機能実装', completed: false }
];

class TodoApp {
  constructor() {
    this.tasks = this.loadTasks();
    this.taskIdCounter = this.getMaxTaskId() + 1;
    this.init();
  }

  // LocalStorage からタスクを読み込む
  loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_TASKS;
  }

  // タスクを LocalStorage に保存する
  saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
  }

  // 最大のタスク ID を取得する
  getMaxTaskId() {
    if (this.tasks.length === 0) return 0;
    return Math.max(...this.tasks.map(task => task.id));
  }

  // 初期化処理
  init() {
    this.setupEventListeners();
    this.renderTasks();
    this.updateEmptyState();
  }

  // イベントリスナーの設定
  setupEventListeners() {
    const taskInput = document.querySelector('.task-input');
    const addButton = document.querySelector('.add-button');

    // 入力フィールドと追加ボタンを有効化
    taskInput.disabled = false;
    addButton.disabled = false;

    // 追加ボタンのクリックイベント
    addButton.addEventListener('click', () => this.addTask(taskInput));

    // Enterキーでタスク追加
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addTask(taskInput);
      }
    });
  }

  // タスクを追加する
  addTask(inputElement) {
    const text = inputElement.value.trim();

    if (!text) {
      alert('タスクを入力してください');
      return;
    }

    const newTask = {
      id: this.taskIdCounter++,
      text: text,
      completed: false
    };

    this.tasks.push(newTask);
    this.saveTasks();
    this.renderTasks();
    this.updateEmptyState();

    // 入力フィールドをクリア
    inputElement.value = '';
    inputElement.focus();
  }

  // タスク一覧を画面に表示する
  renderTasks() {
    const taskList = document.querySelector('.task-list');
    taskList.innerHTML = '';

    this.tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'is-completed' : ''}`;

      li.innerHTML = `
        <div class="task-content">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
          <span class="task-text">${this.escapeHtml(task.text)}</span>
        </div>
        <div class="task-actions">
          <button class="btn-edit">編集</button>
          <button class="btn-delete">削除</button>
        </div>
      `;

      // チェックボックスイベント
      const checkbox = li.querySelector('.task-checkbox');
      checkbox.addEventListener('change', () => this.toggleTask(task.id));

      // 編集ボタンイベント
      const editBtn = li.querySelector('.btn-edit');
      editBtn.addEventListener('click', () => this.editTask(li, task));

      // 削除ボタンイベント
      const deleteBtn = li.querySelector('.btn-delete');
      deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

      taskList.appendChild(li);
    });
  }

  // タスク完了状態を切り替える
  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.renderTasks();
    }
  }

  // タスクを編集する
  editTask(li, task) {
    const taskContent = li.querySelector('.task-content');
    const taskText = li.querySelector('.task-text');

    // 編集中フラグをチェック
    if (li.classList.contains('is-editing')) {
      return;
    }

    // 編集フォームを作成
    const editContainer = document.createElement('div');
    editContainer.className = 'edit-form';
    editContainer.innerHTML = `
      <input type="text" class="edit-input" value="${this.escapeHtml(task.text)}">
      <div class="edit-actions">
        <button class="btn-save">保存</button>
        <button class="btn-cancel">キャンセル</button>
      </div>
    `;

    // 編集フォームに置き換え
    li.classList.add('is-editing');
    taskContent.replaceWith(editContainer);

    // 入力フィールドにフォーカス
    const editInput = editContainer.querySelector('.edit-input');
    editInput.focus();
    editInput.select();

    // 保存ボタン
    const saveBtn = editContainer.querySelector('.btn-save');
    saveBtn.addEventListener('click', () => this.saveEdit(task, editInput.value, li));

    // キャンセルボタン
    const cancelBtn = editContainer.querySelector('.btn-cancel');
    cancelBtn.addEventListener('click', () => this.cancelEdit(li, task));

    // Enterキーで保存、Escapeキーでキャンセル
    editInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveEdit(task, editInput.value, li);
      }
    });
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.cancelEdit(li, task);
      }
    });
  }

  // 編集を保存する
  saveEdit(task, newText, li) {
    const trimmedText = newText.trim();

    if (!trimmedText) {
      alert('タスクを入力してください');
      return;
    }

    task.text = trimmedText;
    this.saveTasks();
    this.renderTasks();
  }

  // 編集をキャンセルする
  cancelEdit(li, task) {
    this.renderTasks();
  }

  // タスクを削除する
  deleteTask(taskId) {
    if (confirm('このタスクを削除しますか？')) {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.saveTasks();
      this.renderTasks();
      this.updateEmptyState();
    }
  }

  // 空状態の表示/非表示を更新する
  updateEmptyState() {
    const emptyState = document.querySelector('.empty-state');
    const taskList = document.querySelector('.task-list');

    if (this.tasks.length === 0) {
      taskList.style.display = 'none';
      emptyState.style.display = 'block';
    } else {
      taskList.style.display = 'block';
      emptyState.style.display = 'none';
    }
  }

  // XSS 対策: HTML エスケープ
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ページロード時にアプリを初期化
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});
