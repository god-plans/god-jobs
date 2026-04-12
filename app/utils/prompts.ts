/** Placeholders: {role}, {stack}, {prefs}, {startupName}, {startupUrl} */

export const masterPrompt = `Act as a startup research assistant and outbound recruiting strategist.

Your goal is to help me find early-stage startups (pre-seed, seed, Series A) that are likely to hire developers and where I can directly contact the CEO or CTO.

Context about me:
- I am a {role} ({stack})
- I have open-source experience on GitHub
- I want to work remotely or in European startups
- I prefer fast-growing startups where I can contribute early
{prefs}

Tasks:

1. Find 10 relevant startups based on:
   - Recently funded (last 6–12 months)
   - Small to mid-size teams (5–50 employees)
   - Tech or SaaS companies
   - Preferably hiring or showing growth signals

2. For each startup, provide:
   - Company name
   - Website
   - What they do (short description)
   - Funding stage and recent funding info
   - Why this startup is a good fit for me
   - Tech stack (if possible, or best guess)
   - CEO or CTO name
   - LinkedIn profile (if available)

3. Suggest 1 personalized improvement idea for each startup:
   (Example: UI/UX improvement, performance optimization, onboarding flow, dashboard redesign)

4. Write a short personalized cold email for each startup:
   - Address CEO/CTO by name
   - Mention something specific about their product
   - Include my value clearly
   - Suggest my improvement idea
   - Keep it under 120 words

5. Format the output as a structured table for easy tracking.

6. Bonus:
   - Suggest which 3 startups I should prioritize (highest chance of response)
   - Explain why

Important rules:
- Avoid generic startups (be specific and relevant)
- Avoid large corporations
- Focus on actionable, realistic insights
- Keep responses concise but valuable`

export const deepAnalysisPrompt = `Analyze this startup deeply and suggest 3 real improvements I can implement quickly.

Startup: {startupName}
URL: {startupUrl}`

export const rewriteEmailPrompt = `Rewrite this email to sound more natural and persuasive. Keep under 120 words. Preserve the specific product mention and my value prop.

--- Email ---
{email}`

export const seniorEngineerPrompt = `Act as a senior product engineer.

For this startup:
{startupName} — {startupUrl}

Give me:
- 3 real frontend improvements I can implement in 2–3 hours
- One idea I can turn into a quick demo or GitHub project
- How I can show this work to impress the CTO`

export const defaultPlaceholders = {
  role: 'frontend developer',
  stack: 'Vue.js, Nuxt, godplans',
  prefs: '',
}

export function fillTemplate(
  template: string,
  vars: Record<string, string | undefined>,
) {
  let out = template
  for (const [key, val] of Object.entries(vars)) {
    out = out.split(`{${key}}`).join(val ?? '')
  }
  return out
}
