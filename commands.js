const pool = require("./pg");


// Users CRUD
async function getUsers(req, res) {
    try {
        const users = await pool.query("SELECT * FROM users");
        res.send(users.rows)
    } catch (err) {
        console.error("❌ Error in getUsers:", err.stack);
    }
}

// ✅ Add User (email unique check)
async function addUser(req, res) {
    const { full_name, email, password } = req.body;

    try {
        // email bor-yo‘qligini tekshiramiz
        const checkEmail = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ message: "Email already exists. Use another one." });
        }

        // yangi user qo‘shamiz
        await pool.query(
            "INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3)",
            [full_name, email, password]
        );

        res.status(201).json({ message: "User added successfully." });
    } catch (error) {
        console.error("❌ Error in addUser:", error.stack);
        res.status(500).json({ message: "Server error", error });
    }
}

// ✅ Update User
async function updateUser(req, res) {
    const { id, full_name, email, password } = req.body;

    try {
        // user bor-yo‘qligini tekshirish
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        // agar email boshqa userga tegishli bo‘lsa, xatolik qaytaramiz
        if (email) {
            const checkEmail = await pool.query("SELECT * FROM users WHERE email = $1 AND id != $2", [email, id]);
            if (checkEmail.rows.length > 0) {
                return res.status(400).json({ message: "Email already in use by another account." });
            }
        }

        // yangilash
        const result = await pool.query(
            `UPDATE users 
       SET full_name = COALESCE($1, full_name), 
           email = COALESCE($2, email), 
           password = COALESCE($3, password)
       WHERE id = $4
       RETURNING *`,
            [full_name, email, password, id]
        );

        res.json({ message: "User updated successfully.", user: result.rows[0] });
    } catch (error) {
        console.error("❌ Error in updateUser:", error.stack);
        res.status(500).json({ message: "Server error", error });
    }
}

async function deleteUser(req, res) {
    const { id } = req.params;

    try {
        // Avval userni tekshiramiz
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" }); // ❗ return qo‘shildi
        }

        // O‘chirish
        await pool.query("DELETE FROM users WHERE id = $1", [id]);

        return res.json({ message: "User deleted!" }); // ❗ bitta response bo‘ldi
    } catch (error) {
        console.error("❌ Error in deleteUser:", error.stack);
        return res.status(500).json({ message: "Server error", error });
    }
}

async function addTest(req, res) {
    const { category, question, options } = req.body;

    try {
        // category bo‘yicha yozuvni topish
        const test = await pool.query(
            "SELECT * FROM tests WHERE LOWER(category) = LOWER($1)",
            [category.toLowerCase()]
        );

        if (test.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        // eski questions massivini olish
        const oldQuestions = test.rows[0].questions || [];

        // yangi question object
        const newQuestion = {
            id: oldQuestions.length + 1,   // id length+1
            question,
            options
        };

        const updatedQuestions = [...oldQuestions, newQuestion];

        // update qilish
        await pool.query(
            "UPDATE tests SET questions = $1 WHERE id = $2",
            [JSON.stringify(updatedQuestions), test.rows[0].id]
        );


        return res.json({ message: "Question added successfully ✅", newQuestion });
    } catch (error) {
        console.error("❌ Error in addTest:", error.stack);
        return res.status(500).json({ message: "Server error", error });
    }
}

async function getTests(req, res) {
    const { limit, category } = req.body;

    try {
        // Category bo‘yicha testni olish
        const testResult = await pool.query(
            "SELECT * FROM tests WHERE LOWER(category) = LOWER($1)",
            [category.toLowerCase()]
        );

        if (testResult.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        // DB'dan questions massivini olish
        let questions = testResult.rows[0].questions || [];

        if (questions.length === 0) {
            return res.status(404).json({ message: "No questions found for this category" });
        }

        // Shuffle (tasodifiy aralashtirish) – Fisher-Yates algoritmi
        questions = questions.sort(() => Math.random() - 0.5);

        // Limitcha savol olish
        const limitedQuestions = questions.slice(0, limit);

        return res.json({
            category: testResult.rows[0].category,
            totalQuestions: questions.length,
            returned: limitedQuestions.length,
            questions: limitedQuestions
        });

    } catch (error) {
        console.error("❌ Error in getTests:", error.stack);
        return res.status(500).json({ message: "Server error", error });
    }
}

async function Login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rowCount === 0) {
            return res.status(404).json({ message: "User with this email is not found." });
        }

        // Passwordni tekshirish
        if (user.rows[0].password === password) {
            return res.json({
                message: "Access successfully.",
                userId: user.rows[0].id
            });
        } else {
            return res.status(401).json({ message: "Password incorrect" });
        }

    } catch (error) {
        console.error("❌ Error in Login:", error.stack);
        return res.status(500).json({ message: "Server error", error });
    }
}

async function getUserbyId(req, res) {
    const { id } = req.params;
    try {
        const user =await pool.query("SELECT * FROM users WHERE id = $1", [id])
        res.send(user.rows[0])
    } catch (error) {
        console.error("❌ Error in getUserbyId:", error.stack);
        return res.status(500).json({ message: "Server error", error });
    }
}


module.exports = { getUsers, addUser, updateUser, deleteUser, addTest, getTests, Login, getUserbyId };
