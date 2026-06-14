<div align="center">

# 📚 PTET Static Website

**Welcome to the PTE Static Website**. This platform is designed to provide aspirants with **accurate, up-to-date, and easy-to-navigate information about the PTE Academic examination**, including **eligibility criteria, exam patterns, important dates, scoring system, and preparation tips.**

<img width="500" height=auto alt="image" src="assets/images/Australia_university.jpg" />
<img width="500" height=auto alt="image" src="assets/images/canada.jpg" alt="Canada" />
     
</div>

<br>

All source code, stylesheets, and visual assets required to run this project are completely self-contained within this repository.

---

## 🛠️ Tech Stack & Tools

The project is built using core web technologies to ensure blazing-fast load times and cross-browser compatibility.

| Technology | Category | Badge |
| :--- | :--- | :--- |
| **HTML5** | Frontend Markup | ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) |
| **CSS3** | Frontend Styling | ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) |
| **JavaScript** | Client-side Logic | ![JavaScript](https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black) |

---

## 📁 Project Structure

A quick overview of how the project files are organized:

```text
ptet-static-website/
├── 📂 assets/images   # Directory containing all visual assets and graphics
│   └── ...
├── 📂 scripts/js      # Directory containing all JS files for pop-up windows, firebase auth, etc.
│   └── ...
├── 📂 components      # Directory containing all reusable components (pop-up window, footer, navbar)
│   └── ...
├── 📂 styles          # Directory containing all website pages (other than index.html)
│   └── 🎨 style.css   # Custom CSS styles for UI layout and responsiveness
│   └── ...
├── 📂 pages           # Directory containing all website pages (other than index.html)
│   └── ...
├── 📄 index.html      # Main landing page and structural backbone
└── 📝 README.md       # Project documentation (this file)

```

---

## 🚀 How to Run
<b>1.</b> Clone the repository:
   ```bash
   git clone https://github.com/mohityadav8/ptet-static-website.git
   ```
<b>2.</b> Open the index.html file in any modern web browser.

---

## 🤝 Contributing
Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

- Issues: Found a bug or want a feature? Feel free to open an Issue.
- Pull Requests (PRs): Want to fix it yourself? Fork the repo, create a new branch, make your improvements, and submit a Pull Request.

---

## 💬 Commit Convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via Husky + commitlint. Every commit message **must** follow this format:

```
<type>(<scope>): <description>
```

- `scope` is optional
- `body` and `footer` are optional
- `description` must be lowercase, no period at end

### Valid types

| Type | Use for |
| :--- | :--- |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no feature/fix |
| `test` | Adding or fixing tests |
| `chore` | Build process, tooling, deps |
| `perf` | Performance improvement |
| `ci` | CI/CD config changes |
| `revert` | Revert a previous commit |

### Good commits

```bash
feat: add hero section to homepage
fix: correct nav link for universities page
docs: update README with project structure
chore: add husky commit-msg hook
feat(auth): add login page
fix(nav): resolve mobile menu overflow
refactor: extract header into component
```

### Bad commits

```bash
# Missing type
added new page

# Uppercase description
feat: Add new page

# Period at end
fix: resolve broken link.

# Vague message
fix: stuff

# Wrong type
update: change button color
```

If your commit message fails validation, the commit will be rejected with an error showing exactly what went wrong.

---

## 📄 License
This project is open-source and primarily intended for learning and educational purposes. You are free to modify and contribute to the code!
