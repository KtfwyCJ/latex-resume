const latex = `\\documentclass[10pt,a4paper]{article}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[default]{lato}
\\usepackage[top=0.6in,bottom=0.6in,left=0.7in,right=0.7in]{geometry}
\\usepackage{xcolor}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{microtype}
\\definecolor{accent}{RGB}{190,30,45}
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\newcommand{\\cvsection}[1]{%
  \\vspace{8pt}%
  \\noindent{\\large\\bfseries\\color{accent}#1\\hspace{6pt}}%
  {\\color{black!25}\\leavevmode\\leaders\\hrule height 0.5ex depth -0.4ex\\hfill\\kern0pt}%
  \\par\\vspace{3pt}%
}

\\begin{document}

{\\centering
  {\\fontsize{38}{46}\\fontseries{l}\\selectfont Jordan }%
  {\\fontsize{38}{46}\\bfseries Lee}\\par
  \\vspace{4pt}
  {\\small\\color{accent}\\scshape Full-Stack Engineer \\textperiodcentered\\ Product-Minded Builder}\\par
  \\vspace{2pt}
  {\\small\\itshape New York, NY}\\par
  \\vspace{4pt}
  {\\small
    (212)~555-0192 \\enspace|\\enspace
    \\href{mailto:jordan.lee@email.com}{jordan.lee@email.com} \\enspace|\\enspace
    \\href{https://jordanlee.dev}{jordanlee.dev} \\enspace|\\enspace
    \\href{https://github.com/jordanlee}{github.com/jordanlee} \\enspace|\\enspace
    \\href{https://linkedin.com/in/jordanlee}{linkedin.com/in/jordanlee}
  }\\par
  \\vspace{8pt}
  {\\small\\itshape \`\`Ship things that matter. Iterate relentlessly.''}\\par
}

\\vspace{8pt}

\\cvsection{Summary}

Full-stack engineer with 8+ years of experience building consumer and enterprise web products from 0 to scale. Strong background in React, Node.js, and cloud-native architectures. Comfortable owning features end-to-end — from API design and database modelling to UI implementation and production monitoring. Enjoys working in small, high-trust teams where speed and quality are both valued.

\\vspace{6pt}

\\cvsection{Work Experience}

\\noindent\\textbf{Stripe}\\hfill\\textit{New York, NY}\\\\
{\\scshape\\small Senior Software Engineer}\\hfill{\\small\\itshape Feb. 2022 -- Present}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt,parsep=0pt]
  \\item Redesigned the merchant onboarding flow, reducing time-to-first-payment by 35\\% across 50k+ new accounts per month.
  \\item Built a real-time fraud signal aggregation service in Go, processing 2M+ events per minute with sub-10ms p99 latency.
  \\item Led a 4-engineer squad shipping Stripe Tax in 6 new EU jurisdictions, coordinating with legal and compliance teams.
\\end{itemize}

\\vspace{4pt}
\\noindent\\textbf{Notion}\\hfill\\textit{San Francisco, CA}\\\\
{\\scshape\\small Software Engineer}\\hfill{\\small\\itshape Aug. 2019 -- Jan. 2022}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt,parsep=0pt]
  \\item Owned the collaborative editing engine's conflict-resolution layer, reducing data-loss incidents by 90\\%.
  \\item Rebuilt the mobile web experience with React and service workers, lifting mobile DAU retention by 18\\%.
  \\item Introduced end-to-end Playwright test suite covering 120+ critical user journeys, cutting regression rate in half.
\\end{itemize}

\\vspace{4pt}
\\noindent\\textbf{Thoughtworks}\\hfill\\textit{Chicago, IL}\\\\
{\\scshape\\small Application Developer}\\hfill{\\small\\itshape Jun. 2016 -- Jul. 2019}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt,parsep=0pt]
  \\item Delivered full-stack features for a Fortune 500 retail client's e-commerce platform serving 3M monthly visitors.
  \\item Mentored 5 junior developers across two client engagements; led internal React training for 20+ consultants.
\\end{itemize}

\\vspace{6pt}

\\cvsection{Honors \\& Awards}

{\\small\\scshape Industry Recognition}\\par\\vspace{2pt}
\\begin{tabular*}{\\linewidth}{@{}r@{\\quad}l@{\\extracolsep{\\fill}}r@{}}
  2023 & \\textbf{Engineering Excellence Award,} Stripe All-Hands & \\textit{New York, NY} \\\\
  2022 & \\textbf{Top 50 Developers to Watch,} Software Engineering Daily & \\textit{Online} \\\\
  2020 & \\textbf{Best Developer Tool,} Y Combinator Demo Day (side project) & \\textit{San Francisco, CA} \\\\
\\end{tabular*}

\\vspace{4pt}
{\\small\\scshape Hackathons}\\par\\vspace{2pt}
\\begin{tabular*}{\\linewidth}{@{}r@{\\quad}l@{\\extracolsep{\\fill}}r@{}}
  2021 & \\textbf{1st Place,} HackNY Fall Hackathon & \\textit{New York, NY} \\\\
  2019 & \\textbf{Best UX,} TechCrunch Disrupt Hackathon & \\textit{San Francisco, CA} \\\\
\\end{tabular*}

\\vspace{4pt}
{\\small\\scshape Community}\\par\\vspace{2pt}
\\begin{tabular}{@{}r@{\\quad}l@{}}
  2023 -- & \\textbf{Speaker,} React Summit, JSConf, and Strange Loop \\\\
  2021 -- & \\textbf{Open Source Maintainer,} \\href{https://github.com/jordanlee/typesafe-router}{typesafe-router} (2.4k stars) \\\\
  2020 -- & \\textbf{Mentor,} Code2040 Fellowship Program \\\\
\\end{tabular}

\\vspace{6pt}

\\cvsection{Certificates}

\\begin{tabular}{@{}r@{\\quad}l@{}}
  2023 & \\textbf{AWS Certified Solutions Architect -- Associate,} Amazon Web Services \\\\
  2022 & \\textbf{Professional Scrum Master I (PSM I),} Scrum.org \\\\
  2021 & \\textbf{Google Cloud Professional Data Engineer,} Google Cloud \\\\
  2020 & \\textbf{MongoDB Certified Developer,} MongoDB University \\\\
\\end{tabular}

\\vspace{6pt}

\\cvsection{Education}

\\noindent\\textbf{Carnegie Mellon University}\\hfill\\textit{Pittsburgh, PA}\\\\
{\\scshape\\small B.S. in Computer Science}\\hfill{\\small\\itshape Aug. 2012 -- May 2016}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt,parsep=0pt]
  \\item Minor in Human--Computer Interaction; GPA 3.7/4.0
  \\item Capstone: \\textit{Adaptive UI Generation from Natural Language Descriptions using LLMs}
\\end{itemize}

\\end{document}`;

export default latex;
