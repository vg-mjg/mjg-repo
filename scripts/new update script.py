# Part 1: Edit the parameters here, can't be bothered making a GUI

# Type of update 
up_type="(majsoul plus mod)"
# Link of update, if available. If not, leave as #
up_link="#"
# Title of Update
up_title="Title of update"
# Short and witty description here
up_desc="Witty description here."

# Set type
# 1 = OCs
# 2 = Library
x = 2


# ##### OCs
# Enable banner? 1 = yes, 0 = no.
b = 0
# Banner, normally at banners/
up_banner="#"
# Put something here if you need a different description from the short one above. Leave blank if you don't need to.
up_lngdsc=""
# The content of the OC here. Multiline, if you have more than one entry.
# Video: <a href=\"https://files.catbox.moe/e5ipjy.webm\">Catbox</strong></a>
# Music: <audio controls>\n<source src=\"https://files.catbox.moe/e0pgky.mp3\" type=\"audio/mp3\">\n</audio>
up_cont=""""""




# Part 2: The code itself
# #########################################
with open('output.txt', 'w') as fpOut:
    
    # For the Updates banner
    fpOut.write("<li><a href=\""+up_link+"\"><strong>"+up_title+"</strong></a> <em>"+up_type+"</em><br>\n")
    fpOut.write("<small>"+up_desc+"</small></li>\n\n")
    
    if x == 2:
        fpOut.write("<tr>\n")
        fpOut.write("\t<th scope=\"row\"><h2>"+up_title+"</h2>")
        if b == 1:
            fpOut.write("<p><img src=\""+up_banner+"\" width=\"350\" height=\"88\" alt=\"\"/></p></th>")
        fpOut.write("\n")
        if up_lngdsc:
            fpOut.write("<td align=\"left\"><p>"+up_lngdsc+"</span></td>")
        else:
            fpOut.write("<td align=\"left\"><p>"+up_desc+"</span></td>")
        


