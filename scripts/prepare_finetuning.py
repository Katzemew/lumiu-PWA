import csv
import json
import os
import random

input_file = os.path.join(os.getcwd(), 'public', 'dataset', 'adhd_data.csv')
output_file = os.path.join(os.getcwd(), 'public', 'dataset', 'finetuning_dataset.jsonl')

def generate_system_prompt(row):
    return "You are Lumiu's Adaptability Engine, an expert AI assistant specialized in adapting educational strategies and diagnosing learning profiles based on user metrics."

def generate_user_content(row):
    focus = row.get('Focus_Score_Video', 'N/A')
    org = row.get('Difficulty_Organizing_Tasks', 'N/A')
    sleep = row.get('Sleep_Hours', 'N/A')
    age = row.get('Age', 'N/A')
    devices = row.get('Daily_Phone_Usage_Hours', 'N/A')
    
    return f"User Cognitive Profile:\n- Age: {age}\n- Sleep Hours: {sleep}\n- Screen Time: {devices}h\n- Focus Score (Video): {focus}/10\n- Difficulty Organizing: {org}\n\nProvide an analysis of this profile and a learning strategy."

def generate_assistant_content(row):
    try:
        d_class = int(float(row.get('Diagnosis_Class', 0)))
    except ValueError:
        d_class = 0
        
    try:
        org_val = float(row.get('Difficulty_Organizing_Tasks', 0))
    except ValueError:
        org_val = 0

    if d_class == 0:
        diagnosis = "Control (Neurotypical profile)"
        strategy = "Use standard structured learning. The user has a stable focus threshold."
    elif d_class == 1:
        diagnosis = "ADHD - Predominantly Inattentive Type"
        strategy = "Use highly engaging, segmented content. Minimize distractions and break tasks into micro-steps to combat low focus scores."
    elif d_class == 2:
        diagnosis = "ADHD - Predominantly Hyperactive-Impulsive Type"
        strategy = "Incorporate interactive, frequent-feedback mechanisms. Allow for kinetic learning and frequent short breaks."
    else:
        diagnosis = "ADHD - Combined Type"
        strategy = "Provide highly structured, short-burst modules. Use clear multi-modal (visual+kinetic) engagement to sustain attention and support organizational difficulties."
        
    org_advice = "Provide explicit organizational frameworks (checklists, UI templates)." if org_val >= 0.6 else "Standard task complexity is acceptable."
    
    return f"Analysis: The profile aligns closely with '{diagnosis}'.\n\nRecommended Educational Strategy: {strategy} {org_advice}"

records = []
try:
    with open(input_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        data = list(reader)
        
        # We don't want to use all 6500 rows, that would be too large and possibly repetitive.
        # Let's take a representative stratified sample of 500 rows for high-quality fine-tuning.
        random.seed(42)
        sample_data = random.sample(data, min(500, len(data)))
        
        for row in sample_data:
            # We use the openAI/Gemini standard chat format
            record = {
                "messages": [
                    {"role": "system", "content": generate_system_prompt(row)},
                    {"role": "user", "content": generate_user_content(row)},
                    {"role": "assistant", "content": generate_assistant_content(row)}
                ]
            }
            records.append(record)

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, mode='w', encoding='utf-8') as out:
        for r in records:
            out.write(json.dumps(r) + '\n')
            
    print(f"Successfully created fine-tuning dataset at:\n{output_file}\nTotal examples: {len(records)}")
except Exception as e:
    print(f"Error processing dataset: {e}")
