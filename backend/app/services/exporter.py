import json
import csv
import io
from typing import Dict, Any

class Exporter:
    """Exports candidate profile and match analysis to JSON, CSV, or formatted text/PDF."""

    @staticmethod
    def export_json(candidate_data: Dict[str, Any]) -> str:
        return json.dumps(candidate_data, indent=2, default=str)

    @staticmethod
    def export_csv(candidates_list: list) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(["ID", "Full Name", "Email", "Phone", "Location", "Years of Experience", "Top Skills"])
        
        for cand in candidates_list:
            writer.writerow([
                cand.get("id"),
                cand.get("full_name"),
                cand.get("email"),
                cand.get("phone"),
                cand.get("location"),
                cand.get("years_of_experience"),
                ", ".join(cand.get("top_skills_json", []))
            ])
            
        return output.getvalue()
