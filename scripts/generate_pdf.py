import os
import sys
import re
import subprocess

# Auto-instalar ReportLab si no está disponible
try:
    import reportlab
except ImportError:
    print("La librería 'reportlab' no está instalada. Instalando ahora...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab"])
        print("Librería 'reportlab' instalada correctamente.\n")
    except Exception as e:
        print(f"Error al instalar reportlab de forma automática: {e}")
        print("Por favor, ejecuta manualmente: pip install reportlab")
        sys.exit(1)

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def parse_markdown_to_story(md_path, img_path, styles):
    story = []
    
    if not os.path.exists(md_path):
        print(f"Error: No se encontró el archivo markdown en {md_path}")
        return story

    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Limpiar código de Mermaid (no se puede renderizar directamente en reportlab)
    content = re.sub(r'```mermaid.*?```', '', content, flags=re.DOTALL)
    
    lines = content.split('\n')
    in_table = False
    table_data = []

    for line in lines:
        line_strip = line.strip()
        
        # Omitir líneas vacías en tablas
        if not line_strip:
            if in_table:
                # Cerrar tabla
                story.append(create_pdf_table(table_data, styles))
                story.append(Spacer(1, 12))
                table_data = []
                in_table = False
            continue

        # Procesar tablas de Markdown
        if line_strip.startswith('|'):
            in_table = True
            # Limpiar bordes e ignorar fila de separación |---|---|
            if '---' in line_strip:
                continue
            row = [cell.strip() for cell in line_strip.split('|')[1:-1]]
            table_data.append(row)
            continue
        elif in_table:
            # Si venía una tabla y esta línea no empieza con '|', cerrarla
            story.append(create_pdf_table(table_data, styles))
            story.append(Spacer(1, 12))
            table_data = []
            in_table = False

        # Títulos
        if line_strip.startswith('# '):
            title = line_strip[2:]
            story.append(Paragraph(title, styles['TitleStyle']))
            story.append(Spacer(1, 15))
        elif line_strip.startswith('## '):
            subtitle = line_strip[3:]
            story.append(Paragraph(subtitle, styles['Heading2Style']))
            story.append(Spacer(1, 12))
        elif line_strip.startswith('### '):
            subtitle = line_strip[4:]
            story.append(Paragraph(subtitle, styles['Heading3Style']))
            story.append(Spacer(1, 8))
        
        # Listas con viñetas
        elif line_strip.startswith('* ') or line_strip.startswith('- '):
            item_text = line_strip[2:]
            # Procesar negritas simples
            item_text = format_bold_text(item_text)
            story.append(Paragraph(f"• {item_text}", styles['ListStyle']))
            story.append(Spacer(1, 4))
        
        # Alertas o notas (e.g. > [!WARNING])
        elif line_strip.startswith('>'):
            alert_text = line_strip.replace('>', '').replace('[!WARNING]', '').replace('[!IMPORTANT]', '').strip()
            alert_text = format_bold_text(alert_text)
            story.append(Paragraph(f"<b>ATENCIÓN:</b> {alert_text}", styles['AlertStyle']))
            story.append(Spacer(1, 10))

        # Párrafos normales
        else:
            if line_strip == '---':
                # Línea separadora
                story.append(Spacer(1, 8))
                # Dibujar línea horizontal simple mediante tabla
                line_table = Table([['']], colWidths=[468], rowHeights=[1])
                line_table.setStyle(TableStyle([
                    ('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                    ('TOPPADDING', (0,0), (-1,-1), 0),
                ]))
                story.append(line_table)
                story.append(Spacer(1, 8))
                continue
                
            # Procesar negritas
            text = format_bold_text(line_strip)
            # Omitir referencia de la imagen cruda
            if '![' in text and '.png' in text:
                # Agregar el diagrama de flujo físico aquí
                if os.path.exists(img_path):
                    story.append(Paragraph("<b>Flujo de Decisiones del Motor:</b>", styles['Heading3Style']))
                    story.append(Spacer(1, 6))
                    # Ajustar ancho de imagen para caber en tamaño carta (márgenes de 72pt, ancho útil 468pt)
                    story.append(Image(img_path, width=460, height=260))
                    story.append(Spacer(1, 15))
                else:
                    story.append(Paragraph("[Diagrama de Flujo no disponible en el sistema]", styles['ItalicStyle']))
                continue
                
            story.append(Paragraph(text, styles['NormalStyle']))
            story.append(Spacer(1, 8))
            
    # Si queda una tabla al final del archivo
    if in_table and table_data:
        story.append(create_pdf_table(table_data, styles))
        story.append(Spacer(1, 12))

    return story

def format_bold_text(text):
    # Reemplazar **texto** por <b>texto</b>
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    # Reemplazar *texto* por <i>texto</i>
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    # Reemplazar `código` por <font face="Courier">\1</font>
    text = re.sub(r'`(.*?)`', r'<font face="Courier">\1</font>', text)
    return text

def create_pdf_table(data, styles):
    formatted_data = []
    for i, row in enumerate(data):
        formatted_row = []
        for cell in row:
            # Si es el encabezado, usar estilo negrita
            style = styles['TableHeaderStyle'] if i == 0 else styles['TableCellStyle']
            formatted_row.append(Paragraph(format_bold_text(cell), style))
        formatted_data.append(formatted_row)
        
    t = Table(formatted_data, colWidths=[150, 100, 218])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    return t

def generate_pdf(md_file, img_file, output_pdf):
    # Configurar documento tamaño carta, márgenes de 1 pulgada (72 pt)
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()
    
    # Crear estilos personalizados
    styles.add(ParagraphStyle(
        'TitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E3A8A'),
        alignment=0 # Izquierda
    ))
    
    styles.add(ParagraphStyle(
        'Heading2Style',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#2563EB'),
        spaceBefore=15,
        spaceAfter=5
    ))

    styles.add(ParagraphStyle(
        'Heading3Style',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=4
    ))
    
    styles.add(ParagraphStyle(
        'NormalStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155')
    ))

    styles.add(ParagraphStyle(
        'ListStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        leftIndent=15
    ))

    styles.add(ParagraphStyle(
        'AlertStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#7F1D1D'),
        backColor=colors.HexColor('#FEF2F2'),
        borderColor=colors.HexColor('#FCA5A5'),
        borderWidth=1,
        borderPadding=10,
        spaceBefore=8,
        spaceAfter=8
    ))

    styles.add(ParagraphStyle(
        'TableHeaderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    ))

    styles.add(ParagraphStyle(
        'TableCellStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#334155')
    ))

    styles.add(ParagraphStyle(
        'ItalicStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#64748B')
    ))

    # Construir el flujo del documento
    story = parse_markdown_to_story(md_file, img_file, styles)
    
    if story:
        print(f"Generando el archivo PDF en {output_pdf}...")
        doc.build(story)
        print("¡PDF generado con éxito!")
    else:
        print("Error: No se pudo generar el contenido del PDF.")

if __name__ == '__main__':
    # Rutas por defecto
    default_md = r"C:\Users\coordinadortics.INR.000\.gemini\antigravity-ide\brain\151eadd3-201d-486b-9dde-8985cb5739b1\informe_motor_calculo.md"
    default_img = r"C:\Users\coordinadortics.INR.000\.gemini\antigravity-ide\brain\151eadd3-201d-486b-9dde-8985cb5739b1\diagrama_calculo_motor_1780696385141.png"
    default_pdf = r"C:\Users\coordinadortics.INR.000\.gemini\antigravity-ide\brain\151eadd3-201d-486b-9dde-8985cb5739b1\informe_motor_calculo.pdf"
    
    generate_pdf(default_md, default_img, default_pdf)
