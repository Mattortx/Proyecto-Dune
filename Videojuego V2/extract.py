import zipfile
import re

def extract_text(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        data = z.read('word/document.xml').decode('utf-8')
        texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', data)
        return texts

doc1 = r'c:\Users\jadgg\Desktop\videojuegoTestQwen\Proyecto Dune - Manual de Juego.docx'
doc2 = r'c:\Users\jadgg\Desktop\videojuegoTestQwen\Proyecto Dune - Lore.docx'

texts1 = extract_text(doc1)
texts2 = extract_text(doc2)

with open(r'c:\Users\jadgg\Desktop\videojuegoTestQwen\manual_output.txt', 'w', encoding='utf-8') as f:
    f.write(f'Manual de Juego: {len(texts1)} text elements\n\n')
    for t in texts1[:200]:
        f.write(t + '\n')

with open(r'c:\Users\jadgg\Desktop\videojuegoTestQwen\lore_output.txt', 'w', encoding='utf-8') as f:
    f.write(f'Lore: {len(texts2)} text elements\n\n')
    for t in texts2[:200]:
        f.write(t + '\n')

print(f'Done! Manual: {len(texts1)}, Lore: {len(texts2)}')
