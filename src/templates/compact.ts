const latex: string = `\\documentclass[9.5pt,letterpaper]{article}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{textcomp}
\\usepackage[light,default]{sourcesanspro}
\\usepackage[top=0.45in,bottom=0.45in,left=0.55in,right=0.55in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{xcolor}
\\definecolor{forest}{RGB}{22,101,52}
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\newcommand{\\cvsection}[1]{%
  \\vspace{6pt}%
  \\noindent{\\normalsize\\bfseries\\color{forest}\\MakeUppercase{#1}}\\par
  \\vspace{-4pt}%
  {\\color{forest}\\rule{\\linewidth}{0.8pt}}%
  \\vspace{1pt}%
}

\\begin{document}

{\\centering
  {\\fontsize{20}{24}\\selectfont\\bfseries Rachel Kim}\\par
  \\vspace{3pt}
  {\\small\\color{forest} Principal Engineer \\textbullet{} Systems Architecture \\textbullet{} Platform Infrastructure}\\par
  \\vspace{3pt}
  {\\small rachel.kim@email.com \\quad (650)~555-0192 \\quad linkedin.com/in/rachelkim \\quad Seattle, WA}\\par
}

\\cvsection{Experience}

\\textbf{Principal Engineer} \\hfill {\\color{forest}\\textit{Amazon Web Services}} \\hfill Seattle, WA\\\\
\\textit{Mar 2021 -- Present}
\\begin{itemize}[leftmargin=1.4em,topsep=1pt,itemsep=1pt]
  \\item Lead architecture of Route~53 Resolver, handling 3T+ DNS queries/day globally
  \\item Drove cross-org initiative reducing P99 latency 40\\% across 12 service teams
  \\item Defined engineering roadmap for 2024--2026; presented to VP-level leadership
\\end{itemize}

\\vspace{3pt}
\\textbf{Staff Software Engineer} \\hfill {\\color{forest}\\textit{Uber}} \\hfill San Francisco, CA\\\\
\\textit{Jan 2018 -- Feb 2021}
\\begin{itemize}[leftmargin=1.4em,topsep=1pt,itemsep=1pt]
  \\item Built real-time geospatial indexing system serving 15M+ concurrent riders and drivers
  \\item Reduced infrastructure costs \\$4.2M/year through query optimization and cache warming
  \\item Grew platform team from 4 to 18 engineers; established IC career ladder framework
\\end{itemize}

\\vspace{3pt}
\\textbf{Senior Software Engineer} \\hfill {\\color{forest}\\textit{Pinterest}} \\hfill San Francisco, CA\\\\
\\textit{Jun 2015 -- Dec 2017}
\\begin{itemize}[leftmargin=1.4em,topsep=1pt,itemsep=1pt]
  \\item Re-architected image recommendation pipeline; improved CTR 19\\% at 500M+ DAU scale
  \\item Designed A/B testing framework now used by 50+ product teams across the company
\\end{itemize}

\\vspace{3pt}
\\textbf{Software Engineer} \\hfill {\\color{forest}\\textit{LinkedIn}} \\hfill Sunnyvale, CA\\\\
\\textit{Jul 2012 -- May 2015}
\\begin{itemize}[leftmargin=1.4em,topsep=1pt,itemsep=1pt]
  \\item Built member graph traversal engine powering \`\`People You May Know'' for 100M+ users
  \\item Shipped Kafka integration reducing data pipeline lag from 15~min to under 30~seconds
\\end{itemize}

\\cvsection{Education}

\\textbf{Carnegie Mellon University} \\hfill Pittsburgh, PA\\\\
\\textit{MS, Computer Science} \\hfill 2010 -- 2012

\\vspace{2pt}
\\textbf{University of California, San Diego} \\hfill La Jolla, CA\\\\
\\textit{BS, Computer Engineering, summa cum laude} \\hfill 2006 -- 2010

\\cvsection{Skills}

\\textbf{Languages:} Java, Go, Python, Scala, Rust, C++, SQL\\\\
\\textbf{Systems:} Kafka, Flink, Spark, Cassandra, DynamoDB, Redis, Elasticsearch\\\\
\\textbf{Cloud \\& Infra:} AWS (EC2, ECS, Lambda, RDS), Terraform, Kubernetes, DataDog

\\cvsection{Open Source \\& Writing}

\\textbf{Contributor:} Apache Kafka (10+ merged PRs, 500+ commits reviewed)\\\\
\\textbf{Author:} \`\`Designing Fault-Tolerant Systems at Scale'' --- ACM Queue, Vol.~21 (2023)

\\end{document}`;

export default latex;
