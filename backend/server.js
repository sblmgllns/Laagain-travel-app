import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY // Make sure this is the Service Role Key
// );

// app.post("/ProfileSettings", async (req, res) => {
//   const { userId } = req.body;

//   if (!userId) return res.status(400).json({ message: "User ID is required" });

//   // Admin delete user
//   const { error } = await supabase.auth.admin.deleteUser(userId);
//   if (error) return res.status(500).json({ message: "Error deleting user", error });

//   res.json({ message: "User deleted successfully" });
// });

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
