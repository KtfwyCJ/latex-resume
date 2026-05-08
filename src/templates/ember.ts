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
  {\\fontsize{38}{46}\\fontseries{l}\\selectfont Alex }%
  {\\fontsize{38}{46}\\bfseries Morgan}\\par
  \\vspace{4pt}
  {\\small\\color{accent}\\scshape Software Engineer \\textperiodcentered\\ Open Source Contributor}\\par
  \\vspace{2pt}
  {\\small\\itshape San Francisco, CA}\\par
  \\vspace{4pt}
  {\\small
    (555)~123-4567 \\enspace|\\enspace
    \\href{mailto:alex@email.com}{alex@email.com} \\enspace|\\enspace
    \\href{https://alexmorgan.dev}{alexmorgan.dev} \\enspace|\\enspace
    \\href{https://github.com/alexmorgan}{github.com/alexmorgan} \\enspace|\\enspace
    \\href{https://linkedin.com/in/alexmorgan}{linkedin.com/in/alexmorgan}
  }\\par
  \\vspace{8pt}
  {\\small\\itshape \`\`Be the engineer you want to see in the world.''}\\par
}

\\vspace{8pt}

\\cvsection{Summary}

Seasoned software engineer with 10+ years of experience in cloud infrastructure, DevOps, and distributed systems. Proven track record scaling engineering teams and delivering high-reliability services at fintech and SaaS companies. Passionate about open-source, infrastructure-as-code, and developer tooling that improves team productivity and operational reliability.

\\vspace{6pt}

\\cvsection{Work Experience}

\\noindent\\textbf{Acme Cloud Inc.}\\hfill\\textit{San Francisco, CA}\\\\
{\\scshape\\small Senior DevOps Engineer}\\hfill{\\small\\itshape Jan. 2022 -- Present}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt,parsep=0pt]
  \\item Led migration of 40+ microservices to Kubernetes on AWS EKS, reducing deployment time by 60\\%.
  \\item Designed Terraform modules adopted across 15 AWS accounts for standardized, repeatable infrastructure.
  \\item Implemented GitOps workflows with ArgoCD and Kustomize, improving release confidence and auditability.
\\end{itemize}

\\vspace{4pt}
\\noindent\\textbf{BuildFast Technologies}\\hfill\\textit{Austin, TX}\\\\
{\\scshape\\small Site Reliability Engineer}\\hfill{\\small\\itshape Mar. 2019 -- Dec. 2021}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt,parsep=0pt]
  \\item Established observability stack (Prometheus, Grafana, Elasticsearch) reducing MTTR by 45\\%.
  \\item Saved 28\\% of monthly cloud spend through instance right-sizing and Spot Fleet strategies.
  \\item Onboarded Okta SSO across 18 enterprise tools, strengthening security posture and compliance.
\\end{itemize}

\\vspace{4pt}
\\noindent\\textbf{Pixel Software Co.}\\hfill\\textit{Remote}\\\\
{\\scshape\\small Software Engineer}\\hfill{\\small\\itshape Jun. 2016 -- Feb. 2019}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt,parsep=0pt]
  \\item Built RESTful APIs in Node.js serving 500k+ daily active users at 99.9\\% uptime.
  \\item Designed CI/CD pipelines on CircleCI using Docker, AWS ECR, and blue-green deployments.
\\end{itemize}

\\vspace{6pt}

\\cvsection{Honors \\& Awards}

{\\small\\scshape International Awards}\\par\\vspace{2pt}
\\begin{tabular*}{\\linewidth}{@{}r@{\\quad}l@{\\extracolsep{\\fill}}r@{}}
  2023 & \\textbf{1st Place,} AWS Global GameDay & \\textit{Online} \\\\
  2022 & \\textbf{Finalist,} DEFCON 30th CTF Hacking Competition World Final & \\textit{Las Vegas, U.S.A} \\\\
  2021 & \\textbf{2nd Place,} HashiConf Terraform Challenge & \\textit{Los Angeles, U.S.A} \\\\
\\end{tabular*}

\\vspace{4pt}
{\\small\\scshape Domestic Awards}\\par\\vspace{2pt}
\\begin{tabular*}{\\linewidth}{@{}r@{\\quad}l@{\\extracolsep{\\fill}}r@{}}
  2022 & \\textbf{Gold Prize,} National Cybersecurity Competition & \\textit{San Francisco, CA} \\\\
  2020 & \\textbf{Silver Prize,} Bay Area Hackathon & \\textit{San Jose, CA} \\\\
\\end{tabular*}

\\vspace{4pt}
{\\small\\scshape Community}\\par\\vspace{2pt}
\\begin{tabular}{@{}r@{\\quad}l@{}}
  2022 -- & \\textbf{AWS Community Builder (Containers),} Amazon Web Services \\\\
  2021 -- & \\textbf{HashiCorp Ambassador,} HashiCorp \\\\
  2019 -- & \\textbf{Organizer, Kubernetes SF Meetup} \\\\
\\end{tabular}

\\vspace{6pt}

\\cvsection{Certificates}

\\begin{tabular}{@{}r@{\\quad}l@{}}
  2024 & \\textbf{AWS Certified Solutions Architect -- Professional,} Amazon Web Services \\\\
  2023 & \\textbf{Certified Kubernetes Administrator (CKA),} The Linux Foundation \\\\
  2023 & \\textbf{HashiCorp Certified: Terraform Associate (003),} HashiCorp \\\\
  2022 & \\textbf{AWS Certified Security -- Specialty,} Amazon Web Services \\\\
\\end{tabular}

\\vspace{6pt}

\\cvsection{Education}

\\noindent\\textbf{State University of Technology}\\hfill\\textit{California}\\\\
{\\scshape\\small B.S. in Computer Science}\\hfill{\\small\\itshape Sep. 2012 -- May 2016}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt,parsep=0pt]
  \\item Dean's List (5 semesters); GPA 3.8/4.0
  \\item Senior thesis: \\textit{Automated Infrastructure Scaling with Predictive Load Modelling}
\\end{itemize}

\\end{document}`;

export default latex;
