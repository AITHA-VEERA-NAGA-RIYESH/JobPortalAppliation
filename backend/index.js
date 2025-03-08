import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import { newsLetterCron } from "./automation/newsLetterCron.js";
import path from "path";
dotenv.config({});

const app = express();

// middleware
app.use(express.json());
const _dirname = path.dirname("")
const buildpath = path.join(_dirname,"../frontend/dist")
app.use(express.static(buildpath))
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions = {
    origin:'*',
    credentials:true
}

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;


// api's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
newsLetterCron();

app.listen(PORT,()=>{
    connectDB();
    console.log(`Server running at port ${PORT}`);
})