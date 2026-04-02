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
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} disabled>
          <span class="task-text">${this.escapeHtml(task.text)}</span>
        </div>
        <div class="task-actions">
          <button class="btn-edit" disabled>編集</button>
          <button class="btn-delete" disabled>削除</button>
        </div>
      `;

      taskList.appendChild(li);
    });
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
