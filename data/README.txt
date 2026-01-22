PORTFOLIO DATA FILES
====================

How to Manage Your Portfolio Content:

1. INTERESTS (interests.json)
   - Edit the JSON file to add/remove research interests
   - Change the "rank" field to reorder items (lower rank = higher position)
   - All items have status: "Learning"
   - Format: { id, title, description, rank, status }

2. PROJECTS (projects.json)
   - Add your GitHub projects here
   - Edit "rank" to reorder them (lower rank = first)
   - Format: { id, name, description, language, url, rank }

3. PUBLICATIONS (publications.json)
   - Add preprints, papers, reports here when ready
   - Supports title, note, authors, journal, status fields
   - Format: { id, title, note, status, authors?, journal? }

ADDING NEW ITEMS:
================

Example - Adding a new interest:
{
  "id": 9,
  "title": "New Interest Title",
  "description": "Brief description of what you're interested in.",
  "rank": 9,
  "status": "Learning"
}

Example - Adding a new project:
{
  "id": 4,
  "name": "project-name",
  "description": "What this project does.",
  "language": "Rust",
  "url": "https://github.com/username/project-name",
  "rank": 4
}

Example - Adding a publication:
{
  "id": 2,
  "title": "Paper Title",
  "authors": "Your Name, Co-author",
  "journal": "Conference/Journal Name",
  "note": "Optional note",
  "status": "Published"
}

IMPORTANT NOTES:
================
- Keep IDs unique within each file
- Update the "rank" field to control ordering (1 = first, 2 = second, etc.)
- After editing, the website will automatically update when you refresh
- All changes are applied in real-time - no build process needed
- Ensure JSON syntax is valid (proper quotes, commas, brackets)
