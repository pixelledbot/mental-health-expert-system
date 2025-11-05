from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# --- Helper for severity labels ---
def severity_label(score, bands):
    if score <= bands[0]:
        return "Low"
    if score <= bands[1]:
        return "Mild"
    if score <= bands[2]:
        return "Moderate"
    return "High"

# --- Home page ---
@app.route("/")
def home():
    return render_template("home.html")

# --- Personal info page ---
@app.route("/personal", methods=["GET", "POST"])
def personal():
    if request.method == "POST":
        # capture info
        name = request.form.get("name", "")
        age = request.form.get("age", "")
        gender = request.form.get("gender", "")
        # store in session or pass via query params (simplest: hidden fields in survey)
        return render_template("index.html", name=name, age=age, gender=gender)
    return render_template("personal.html")

# --- Survey submission ---
@app.route("/submit", methods=["POST"])
def submit():
    # Read fields by prefix and count until missing
    def read_prefix(prefix, count):
        vals = []
        for i in range(1, count+1):
            key = f"{prefix}{i}"
            vals.append(int(request.form.get(key, 0)))
        return vals

    mood = read_prefix("mood", 9)
    worry = read_prefix("worry", 7)
    stress = read_prefix("stress", 6)
    sleep = read_prefix("sleep", 4)
    life = read_prefix("life", 5)

    mood_score = sum(mood)
    worry_score = sum(worry)
    stress_score = sum(stress)
    sleep_score = sum(sleep)
    life_score = sum(life)

    mood_label = severity_label(mood_score, (4, 9, 14))
    worry_label = severity_label(worry_score, (3, 7, 11))
    stress_label = severity_label(stress_score, (4, 8, 12))
    sleep_label = severity_label(sleep_score, (2, 5, 8))
    life_label = severity_label(life_score, (3, 7, 10))

    # Wellness index
    norm_mood = mood_score / 27
    norm_worry = worry_score / 21
    norm_stress = stress_score / 18
    norm_sleep = sleep_score / 12
    norm_life = life_score / 15
    wellness = 1 - (norm_mood + norm_worry + norm_stress + norm_sleep + norm_life)/5

    if wellness >= 0.75:
        wellness_text = "Good — You're doing well overall."
    elif wellness >= 0.5:
        wellness_text = "Fair — Some small steps could help."
    elif wellness >= 0.3:
        wellness_text = "Struggling — Consider adopting coping strategies."
    else:
        wellness_text = "Needs attention — Please consider professional support."

    # Friendly suggestions (same as before)
    suggestions = []
    if mood_label in ("Moderate", "High"):
        suggestions.append({"title":"Feeling low or losing interest","advice":"Try small daily activities you used to enjoy. Share how you feel."})
    else:
        suggestions.append({"title":"Mood is stable","advice":"Keep routines and small self-care habits."})

    if worry_label in ("Moderate", "High"):
        suggestions.append({"title":"Worry & restlessness","advice":"Try focused breathing, grounding, or writing down worries."})
    else:
        suggestions.append({"title":"Worry is low","advice":"Maintain relaxation routines."})

    if stress_label in ("Moderate", "High"):
        suggestions.append({"title":"Stress levels","advice":"Prioritize tasks, take short breaks, gentle movement."})
    else:
        suggestions.append({"title":"Stress under control","advice":"Maintain coping routines."})

    if sleep_label in ("Moderate", "High"):
        suggestions.append({"title":"Sleep quality","advice":"Keep a consistent sleep routine."})
    else:
        suggestions.append({"title":"Sleeping okay","advice":"Maintain sleep-friendly habits."})

    if life_label in ("Moderate", "High"):
        suggestions.append({"title":"Daily habits & burnout","advice":"Take short rests and ask for help when tasks pile up."})
    else:
        suggestions.append({"title":"Daily balance","advice":"Good balance — monitor workload and rest."})

    urgent = (mood_score >= 20) or (worry_score >= 15) or (sleep_score >= 10)

    resources = {
        "india": "AASRA helpline: +91 9820466726 (24x7)",
        "global": "Search local crisis line or call emergency services."
    }

    return render_template(
        "result.html",
        mood_score=mood_score, mood_label=mood_label,
        worry_score=worry_score, worry_label=worry_label,
        stress_score=stress_score, stress_label=stress_label,
        sleep_score=sleep_score, sleep_label=sleep_label,
        life_score=life_score, life_label=life_label,
        wellness_text=wellness_text,
        suggestions=suggestions,
        urgent=urgent,
        resources=resources
    )

if __name__ == "__main__":
    app.run(debug=True)
