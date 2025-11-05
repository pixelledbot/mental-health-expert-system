from flask import Flask, render_template, request

app = Flask(__name__)

def severity_label(score, bands):
    """Return a friendly severity label from score and band thresholds."""
    if score <= bands[0]:
        return "Low"
    if score <= bands[1]:
        return "Mild"
    if score <= bands[2]:
        return "Moderate"
    return "High"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/submit", methods=["POST"])
def submit():
    # Read fields by prefix and count until missing
    def read_prefix(prefix, count):
        vals = []
        for i in range(1, count+1):
            key = f"{prefix}{i}"
            vals.append(int(request.form.get(key, 0)))
        return vals

    # Domain question counts (must match index.html/app.js)
    mood = read_prefix("mood", 9)          # Mood & Interest (friendly)
    worry = read_prefix("worry", 7)        # Worry & Restlessness
    stress = read_prefix("stress", 6)      # Stress Levels
    sleep = read_prefix("sleep", 4)        # Sleep Quality
    life = read_prefix("life", 5)          # Daily Lifestyle & Burnout

    # Scores
    mood_score = sum(mood)    # 0 - 27
    worry_score = sum(worry)  # 0 - 21
    stress_score = sum(stress)# 0 - 18
    sleep_score = sum(sleep)  # 0 - 12
    life_score = sum(life)    # 0 - 15

    # Friendly severity mapping (customized thresholds for simple interpretation)
    mood_label = severity_label(mood_score, (4, 9, 14))
    worry_label = severity_label(worry_score, (3, 7, 11))
    stress_label = severity_label(stress_score, (4, 8, 12))
    sleep_label = severity_label(sleep_score, (2, 5, 8))
    life_label = severity_label(life_score, (3, 7, 10))

    # Build a combined "wellness index" (simple average of normalized scores)
    # Normalize each domain to 0-1 by dividing by max possible
    norm_mood = mood_score / 27
    norm_worry = worry_score / 21
    norm_stress = stress_score / 18
    norm_sleep = sleep_score / 12
    norm_life = life_score / 15

    wellness = (1 - (norm_mood + norm_worry + norm_stress + norm_sleep + norm_life) / 5)  # higher is better
    # Map wellness to friendly descriptor
    if wellness >= 0.75:
        wellness_text = "Good — You're doing well overall."
    elif wellness >= 0.5:
        wellness_text = "Fair — Some small steps could help."
    elif wellness >= 0.3:
        wellness_text = "Struggling — Consider adopting coping strategies."
    else:
        wellness_text = "Needs attention — Please consider professional support."

    # Personalized suggestions (friendly, non-medical)
    suggestions = []

    # Mood tips
    if mood_label in ("Moderate", "High"):
        suggestions.append({
            "title": "Feeling low or losing interest",
            "advice": "Try small daily activities you used to enjoy. Even 10 minutes of a hobby or a short walk can help. Share how you feel with a friend or family member."
        })
    else:
        suggestions.append({
            "title": "Mood is stable",
            "advice": "Keep your routines, and check-in with yourself weekly. Small self-care habits sustain mood over time."
        })

    # Worry tips
    if worry_label in ("Moderate", "High"):
        suggestions.append({
            "title": "Worry & restlessness",
            "advice": "Try brief grounding exercises (5-7 minutes), focused breathing, or writing down what worries you and one small next step."
        })
    else:
        suggestions.append({
            "title": "Worry is low",
            "advice": "Continue with relaxation routines and short breaks during the day."
        })

    # Stress tips
    if stress_label in ("Moderate", "High"):
        suggestions.append({
            "title": "Stress levels",
            "advice": "Prioritize one task at a time, set small boundaries, and take short 'reset' breaks. Gentle movement helps reduce stress."
        })
    else:
        suggestions.append({
            "title": "Stress under control",
            "advice": "Maintain your coping routines and build tiny pauses into your day."
        })

    # Sleep tips
    if sleep_label in ("Moderate", "High"):
        suggestions.append({
            "title": "Sleep quality",
            "advice": "Try a consistent sleep routine: wind down 30–60 minutes before bed, limit screens, and avoid caffeine late in the day."
        })
    else:
        suggestions.append({
            "title": "Sleeping okay",
            "advice": "Keep the routine and sleep-friendly habits you've built."
        })

    # Lifestyle tips
    if life_label in ("Moderate", "High"):
        suggestions.append({
            "title": "Daily habits & burnout",
            "advice": "Check for small ways to rest during the day — short walks, stretching, or a 5-minute breathing break. Ask someone for help when tasks pile up."
        })
    else:
        suggestions.append({
            "title": "Daily balance",
            "advice": "Good balance — keep an eye on workload and rest."
        })

    # Urgent flag: if any domain is very high, we gently recommend immediate help
    urgent = (mood_score >= 20) or (worry_score >= 15) or (sleep_score >= 10)

    resources = {
        "india": "AASRA helpline: +91 9820466726 (24x7)",
        "global": "If you're outside India, search for your local crisis line or call emergency services."
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
