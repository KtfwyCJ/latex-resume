const latex: string = `\\documentclass[11pt,letterpaper]{article}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{textcomp}
\\usepackage{palatino}
\\usepackage[top=0.7in,bottom=0.7in,left=0.85in,right=0.85in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{xcolor}
\\usepackage{microtype}
\\definecolor{burgundy}{RGB}{128,0,32}
\\definecolor{gold}{RGB}{180,140,60}
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\newcommand{\\cvsection}[1]{%
  \\vspace{10pt}%
  \\noindent{\\large\\bfseries\\color{burgundy} #1}\\par
  \\vspace{-7pt}%
  {\\color{gold}\\rule{\\linewidth}{0.8pt}}%
  \\vspace{3pt}%
}

\\begin{document}

{\\centering
  {\\fontsize{26}{30}\\selectfont\\scshape\\color{burgundy} Eleanor Whitfield}\\par
  \\vspace{4pt}
  {\\small\\color{burgundy} Partner, Corporate Law \\quad\\textbullet{}\\quad New York, NY}\\par
  \\vspace{3pt}
  {\\small eleanor.whitfield@email.com \\quad|\\quad (212)~555-8821 \\quad|\\quad linkedin.com/in/ewhitfield}\\par
  \\vspace{5pt}
  {\\color{gold}\\rule{0.65\\linewidth}{1pt}}\\par
}

\\vspace{4pt}

\\cvsection{Professional Summary}
Senior corporate attorney with 14 years of experience in mergers \\& acquisitions, securities law, and private equity. Consistently ranked in Chambers USA and Legal 500. Advised on \\$12B+ in aggregate deal value across technology, healthcare, and consumer sectors.

\\cvsection{Experience}

\\textbf{Partner} \\hfill \\textit{Sullivan \\& Cromwell LLP} \\hfill New York, NY\\\\
\\textit{2018 -- Present}
\\begin{itemize}[leftmargin=1.6em,topsep=2pt,itemsep=2pt]
  \\item Lead M\\&A counsel on 30+ cross-border transactions each exceeding \\$100M in value
  \\item Advised on SoftBank's \\$4.2B acquisition of technology portfolio companies across 7 jurisdictions
  \\item Chair of firm Pro Bono Committee; oversaw 2,400+ hours of community legal services annually
\\end{itemize}

\\vspace{6pt}
\\textbf{Associate} \\hfill \\textit{Skadden, Arps, Slate, Meagher \\& Flom LLP} \\hfill New York, NY\\\\
\\textit{2012 -- 2018}
\\begin{itemize}[leftmargin=1.6em,topsep=2pt,itemsep=2pt]
  \\item Structured leveraged buyout transactions for private equity clients including KKR and Carlyle
  \\item Coordinated regulatory filings across SEC, CFIUS, and international antitrust bodies
  \\item Drafted and negotiated purchase agreements, disclosure schedules, and ancillary documents
\\end{itemize}

\\cvsection{Education}

\\textbf{Yale Law School} \\hfill New Haven, CT\\\\
\\textit{Juris Doctor, Order of the Coif} \\hfill 2009 -- 2012

\\vspace{4pt}
\\textbf{Princeton University} \\hfill Princeton, NJ\\\\
\\textit{BA, Economics, summa cum laude} \\hfill 2005 -- 2009

\\cvsection{Admissions \\& Recognition}

\\begin{itemize}[leftmargin=1.6em,topsep=2pt,itemsep=1pt]
  \\item Admitted: New York Bar (2012), District of Columbia Bar (2013), England \\& Wales (2019)
  \\item Chambers USA, Band~1 --- Corporate/M\\&A: 2021, 2022, 2023, 2024
  \\item The Legal 500, Hall of Fame --- Mergers \\& Acquisitions: 2022, 2023, 2024
  \\item ABA Business Law Section, Vice Chair (2023--Present)
\\end{itemize}

\\cvsection{Selected Publications \\& Speaking}

\\begin{itemize}[leftmargin=1.6em,topsep=2pt,itemsep=1pt]
  \\item \`\`SPAC Structures in a Post-Regulation Era,'' \\textit{Harvard Business Law Review}, Vol.~14 (2023)
  \\item Keynote: \\textit{Cross-Border M\\&A Complexity}, ABA Annual Meeting, Chicago (2022)
\\end{itemize}

\\end{document}`;

export default latex;
