import os, sys

namefile = sys.argv[1]
name, filetype = os.path.splitext(namefile)

#En-tête : À l'heure actuelle non modifié
file_intro = "<shot-extract>\n"

#Extraction des listes de numéro de frame vers un tableau de tableaux
def tex2tab(name):
	file = open(name, "r")
	tab_shots=[]
	nblines=0
	for line in file:
		curr_line=line.rstrip()
		word=""
		i_word=0
		tab_line=[]
		for c in curr_line:
			if c == " ":
				if(word!="0"): #Filtrage des valeurs 0 qui sont des valeurs non trouvées
					tab_line.append(word)
					i_word+=1
				word=""
			else: word+=c
		if(word!="" and word!="0"): tab_line.append(int(word))
		tab_shots.append(tab_line)
		nblines+=1
	return tab_shots

#Extract into table :
tab_sho = tex2tab(name+"_shots.txt")
tab_sce = tex2tab(name+"_scenes.txt")

#Shot beginings and endings
sho_beg, sho_end = [], []
#Scenes begining and endings
sce_beg, sce_end = [], []
#set of «interesting frames» (keep it ?)
fra_set = set()
#Filling tables
for line in tab_sho:
	sho_beg.append(int(line[0]))
	sho_end.append(int(line[1]))
	for it in range(2, len(line)): fra_set.add(int(line[it]))

for line in tab_sce:
	sce_beg.append(int(line[0]))
	sce_end.append(int(line[1]))
	for it in range(2, len(line)): fra_set.add(int(line[it]))

nb_sho, nb_sce=len(tab_sho), len(tab_sce)

body=""

for it_sce in range(nb_sce):
	body += "\t<scene "
	body += "startFrame = \""+str(sce_beg[it_sce])+"\" "
	body += "endFrame = \""+str(sce_end[it_sce])+"\""
	body += ">\n"
	body += "\t\t<sceneProperties>\n"
	body += "\t\t</sceneProperties>\n"
	for it_sho in range(nb_sho):
		#If a shot is in the scene we add it
		if(sho_beg[it_sho]>=sce_beg[it_sce] and sho_end[it_sho]<=sce_end[it_sce]):
			body += "\t\t<shot "
			body += "startFrame = \""+str(sho_beg[it_sho])+"\" "
			body += "endFrame = \""+str(sho_end[it_sho])+"\""
			body += ">\n"
			body += "\t\t\t<shotProperties>\n"
			body += "\t\t\t</shotProperties>\n"
			#frames in the shot
			for fra in fra_set:
				if fra>=sho_beg[it_sho] and fra<=sho_end[it_sho]:
					body += "\t\t\t<frame "
					body += "timeId = \""+str(fra)+"\""
					body += ">\n"
					body += "\t\t\t\t<frameProperties>\n"
					body += "\t\t\t\t</frameProperties>\n"
					body += "\t\t\t</frame>\n"
			body += ("\t\t</shot>\n")
	body += "\t</scene>\n"

#Print de la concaténation des parties
text_file = open(name+".xml", "w")
text_file.write(file_intro+body+"</shot-extract>\n")
text_file.close()

print("done")
