import pandas as pd
import json

# Load data from CSV file
data = pd.read_csv("AusWeeklyIncomeByAge.csv")

# Generate a Vega-Lite specification for the stacked donut chart
vega_spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "data": {"values": data.to_dict(orient="records")},
    "transform": [
        {"fold": ["Negative or Nil income (%)", "$1-$249 (%)", "$250-$499 (%)", "$500-$999 (%)", "$1,000-$1,499 (%)", "$1,500-$1,999 (%)", "$2,000-$2,999 (%)", "$3,000 or more (%)"], "as": ["Income Bracket", "Percentage"]}
    ],
    "mark": {"type": "arc", "innerRadius": 60},
    "encoding": {
        "theta": {"field": "Percentage", "type": "quantitative"},
        "color": {"field": "Income Bracket", "type": "nominal"},
        "tooltip": [{"field": "Income Bracket"}, {"field": "Percentage"}]
    },
    "config": {
        "view": {"stroke": "transparent"},
        "arc": {"cornerRadius": 0}
    }
}

# Convert the Vega-Lite specification to JSON
vega_json = json.dumps(vega_spec, indent=2)

# Save the JSON to a .vega file
with open("stacked_donut_chart.vega", "w") as f:
    f.write(vega_json)
