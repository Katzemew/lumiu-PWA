import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), "public", "dataset", "adhd_data.csv");
        
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
        }

        const csvData = fs.readFileSync(filePath, "utf-8");
        
        // Parse CSV to JSON
        const parsed = Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
        });

        // Limit results to 500 for performance (the file has 6500+)
        const limitedData = parsed.data.slice(0, 500);

        // Calculate some basic statistics
        const summary = {
            totalRows: parsed.data.length,
            averageAge: parsed.data.reduce((acc: number, cur: any) => acc + (cur.Age || 0), 0) / parsed.data.length,
            averageFocusScore: parsed.data.reduce((acc: number, cur: any) => acc + (cur.Focus_Score_Video || 0), 0) / parsed.data.length,
            averageOrgDifficulty: parsed.data.reduce((acc: number, cur: any) => acc + (cur.Difficulty_Organizing_Tasks || 0), 0) / parsed.data.length,
            genderDistribution: parsed.data.reduce((acc: any, cur: any) => {
                const g = cur.Gender === 1 ? "Male" : "Female";
                acc[g] = (acc[g] || 0) + 1;
                return acc;
            }, {}),
            diagnosisClasses: parsed.data.reduce((acc: any, cur: any) => {
                const c = cur.Diagnosis_Class;
                acc[c] = (acc[c] || 0) + 1;
                return acc;
            }, {})
        };

        return NextResponse.json({
            data: limitedData,
            summary
        });

    } catch (error: any) {
        console.error("Dataset API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
