from flask import Flask, request, jsonify
import pandas as pd
import json
import magic

app = Flask(__name__)

def process_csv(file):
    try:
        # Check if file is valid CSV
        mime_type = magic.from_buffer(file.read(1024), mime=True)
        if not mime_type.startswith("text/csv"):
            return {"error": "Error: Invalid file format. Please upload a CSV file."}  # Modified to return JSON
        df = pd.read_csv(file, header=None, skiprows=1)
        print('df',df)
        data = df.to_dict(orient="records")  # Convert DataFrame to list of dictionaries
        return {"data": data}  # Modified to return JSON
    except FileNotFoundError:
        return {"error": "Error: File not found."}  # Modified to return JSON
    except pd.errors.ParserError:
        return {"error": "Error: Invalid CSV format."}  # Modified to return JSON
    except Exception as e:
        # Handle other unexpected errors
        return {"error": f"Error: {str(e)}"}  # Modified to return JSON

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file part"})

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"})

    processed_data = process_csv(file)

    if "error" in processed_data:
        return jsonify(processed_data)  # Return JSON error response
    
    return jsonify(processed_data)  # Return JSON success response

if __name__ == "__main__":
    app.run(debug=True)