
# Gitchecker 🛠️

A simple GitHub dashboard built with **Next.js**, **React**, and **Tailwind CSS**. This tool helps users fetch and view GitHub profiles and repositories in a clean interface.

---

## 🚀 Features

- Fetches GitHub user data dynamically via URL (e.g., `/cybruGhost`)
- Displays repositories, followers, and GitHub stats
- Clean, modern UI with Tailwind CSS styling
- Error handling for invalid usernames
- Ready to deploy with Next.js routing

---
note limits may apply

## 🧱 Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/cybruGhost/Gitchecker.git
cd Gitchecker

2. Install Dependencies (with conflict resolution)

npm install --legacy-peer-deps

> ⚠️ Note: Resolved a date-fns conflict with react-day-picker using --legacy-peer-deps.



3. Run the Development Server

npm run dev

Make sure next, react, and react-dom are installed:

npm install next react react-dom --legacy-peer-deps


---

🔧 Fixes and Adjustments

✅ Fixed missing next command by manually installing next, react, and react-dom.

✅ Used --legacy-peer-deps to resolve date-fns version conflict.

✅ Force pushed the local repo to GitHub due to remote history conflict:
 i will fix streaming issues

git push -u origin main --force

✅ Ensured .next server folder is excluded using .gitignore



---

💡 Folder Structure

/github-dashboard
  ├── /app
  │   └── /[username]/page.js  ← Dynamic route for GitHub profiles
  ├── /components              ← React UI components
  ├── /public                  ← Static assets
  ├── /styles                 ← Tailwind and custom CSS
  ├── .gitignore
  ├── package.json
  └── README.md


---

🖼️ Screenshots

> Add screenshots here once the UI is finalized.




---

🧠 Future Improvements

Add dark mode toggle 🌙

Paginate repositories

Mobile-responsive design enhancements

Support for GitHub Gists



---

👨‍💻 Author

cybruGhost
🔗 github.com/cybruGhost


---

📜 License

This project is an open-source and available under the MIT License.
...you can open an issue to add something
---
