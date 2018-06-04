const welcomeEmail = (url)=>{
  return (
    `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html>
      <head>
        <meta http-equiv="content-type" content="text/html"; charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="x-ua-compatible" content="IE=edge" />
        <title>Bienvenue</title>
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300|Nunito:300" rel="stylesheet">
        <style type="text/css">
          #bodyTable{
            width:100% !important;
            height:100% !important;
            margin:0 !important;
            padding:0 !important;
          }
          table[align=center]{
            margin:0 auto !important;
          }
          @media only screen and (max-width: 480px){
            .headerImage{
              height:auto !important; max-width:100% !important;
            }
          }
          @media only screen and (max-width: 480px){
            .emailContent{
              margin-top:15px !important;
            }
          }
          @media only screen and (max-width: 480px){
            td.emailBody,td.emailFooter{
              text-align:left !important;
            }
          }
          @media only screen and (max-width: 480px){
            .ctaButton{
              max-width:250px !important;
              width:200px !important;
            }
          }
          .emailBody {
            background-color: #f5f5f5;
            width: 100%;
            margin: 0;
          }
          .emailContainer {
            border: 0;
            border-spacing: 0;
            cellpadding: 0;
            cellspacing: 0;
            width: 100%;
          }
          .brandcolorPrimary {
            background-color: #003d5c;
          }
          .brandcolorSecondary {
            background-color: #E3DE00;
          }
        </style>
      </head>
      <body class="emailBody" style="">
        <center>
          <table border="0" cellpadding="0" cellspacing="0" width="600" id="bodyTable">
            <tbody>
              <tr>
                <td align="center">
                  <table class="emailContainer" style="max-width:550px;">
                    <!-- Header -->
                    <tbody>
                      <tr>
                        <td valign="top" bgcolor="#003d5c" width="100%">
                          <img src="https://static.wixstatic.com/media/078127_6d46d897f14149ab9de07f4a1b1295c7~mv2.png/v1/crop/x_62,y_139,w_988,h_366/fill/w_480,h_164,al_c,usm_0.66_1.00_0.01/078127_6d46d897f14149ab9de07f4a1b1295c7~mv2.png" alt="Bik'Box" width="50%" style="display: block;mso-margin-top-alt:0px; mso-margin-bottom-alt:0px; mso-padding-alt: 0px 0px 0px 0px;" border="0" class="headerImage" />
                        </td>
                      </tr>
                      <tr border="0" cellpadding="0" cellspacing="0">
                        <td class="brandcolorPrimary" style="padding-bottom:30px;">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" class="emailContentContainer brandcolorPrimary">
                            <tbody>
                              <tr>
                                <td align="center" valign="top" width="100%">
                                  <table bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:510px;border-top:5px solid #E3DE00;" class="emailContent">
                                    <!-- Body Content -->
                                    <tbody>
                                      <tr>
                                        <td style="font-family:'Nunito', sans-serif; font-weight:400;line-height:28px;font-size:22px;padding:30px 30px 15px;text-align:left;" class="emailBody">Bienvenue sur Bik'Box</td>
                                      </tr>
                                      <tr>
                                        <td bgcolor="#ffffff" style="font-family:'Nunito', sans-serif; font-size:12px; padding:10px 30px; text-align:left;" align="center" class="emailBody">Bonjour et bienvenue !</td>
                                      </tr>
                                      <tr>
                                        <td bgcolor="#ffffff" style="font-family:'Nunito', sans-serif; font-size:12px; padding:10px 10px 20px 30px;text-align:left;" align="center" class="emailBody">Nous sommes heureux de vous compter parmi nous. Mais avant toute chose, merci de définir votre mot de passe pour pouvoir accéder à l'interface 😀</td>
                                      </tr>
                                      <tr>
                                        <td width="100%" bgcolor="#ffffff" style="font-family:'Nunito', sans-serif; font-size:12px;padding:10px 0 30px 0;text-align:center;" align="center" class="emailBody">
                                          <table width="60%" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;" align="center">
                                            <tbody>
                                              <tr>
                                                <td align="center" bgcolor="#E3DE00" width="10%" style="border-radius:5px;"> <a href="${url}" style="padding:10px; width:300px; display:block; text-decoration:none; border:1px solid #E3DE00; text-align:center; font-weight:bold; font-size:14px; font-family:'Nunito', sans-serif; color:#003d5c; background:#E3DE00; border-radius:5px; line-height:17px;" class="ctaButton"> Définir mon mot de passe </a> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>

                                      <tr>
                                        <td bgcolor="#ffffff" style="font-family:'Nunito', sans-serif;font-size:12px;padding:0px 30px;text-align:left;" align="center" class="emailBody"> Si vous n'êtes pas à l'origine de cette demande ou avez besoin d'aide, n'hésitez pas à nous contacter : <a href="mailto:bonjour@bikbox.com" style="font-family:Nunito, sans-serif; color:#003d5c; text-decoration:none;" >bonjour@bikbox.com</a><br /> <br /> </td>
                                      </tr>

                                      <tr>
                                        <td bgcolor="#ffffff" style="font-family:'Nunito', sans-serif;font-size:12px;padding:0px 0px 20px 30px;text-align:left;" align="center" class="emailBody"> L'équipe Bik'Box 🚲</td>
                                      </tr>
                                      <!-- End of .emailBody -->
                                      <tr>
                                        <td>
                                          <table bgcolor="#e8e8e8" border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <!-- Footer -->
                                            <tbody>
                                              <tr>
                                                <td style="font-family:'Montserrat', sans-serif; font-size:10px; padding:25px 30px 5px 30px;" class="emailFooter"> &copy;${new Date().getFullYear()} Bik'Box SAS, tout droits réservés. </td>
                                              </tr>

                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <!-- End of .emailContent -->
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <!-- End of .emailContentContainer -->
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <!-- End of emailContainer -->
                </td>
              </tr>
            </tbody>
          </table>
          <!-- End of #bodyTable -->
        </center>
      </body>
    </html>`
)};

module.exports=welcomeEmail;
