const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Replace with your values
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // store securely in environment variable
const REPO_OWNER = "almlbi";
const REPO_NAME = "freelance";
const FILE_PATH = "loan_requests.csv";

app.post("/submit", async (req, res) => {
  const { name, email, phone, loanType } = req.body;
  const newRow = `\n${name},${email},${phone},${loanType}`;

  try {
    // Get current file content
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const data = await response.json();
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    const updatedContent = content + newRow;

    // Commit updated file
    await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Add new loan request",
        content: Buffer.from(updatedContent).toString("base64"),
        sha: data.sha
      })
    });

    res.send("✅ Loan request saved to GitHub!");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error saving loan request");
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
