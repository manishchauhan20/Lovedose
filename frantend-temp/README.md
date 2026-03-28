# Template Source

Add or edit proposal templates in `templates.json`.

Each object must follow:

```json
{
  "id": "gf-new-template",
  "relationshipType": "GF",
  "name": "Template Name",
  "tagline": "Short preview line",
  "description": "Longer explanation shown in the chooser",
  "family": "romantic"
}
```

Allowed values:

- `relationshipType`: `GF`, `Wife`, `Crush`
- `family`: `romantic`, `royal`, `dreamy`

After editing, run the frontend with:

```bash
npm run dev
```

or:

```bash
npm run sync:templates
```
