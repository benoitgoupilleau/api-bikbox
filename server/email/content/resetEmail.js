const editmailcontent = (user, url)=>{
  return (
    `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html>
      <head>
        <meta http-equiv="content-type" content="text/html"; charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="x-ua-compatible" content="IE=edge" />
        <title>Welcome to Bikbox</title>
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300|Nunito:300" rel="stylesheet">
        <style type="text/css">
          #bodyTable{ width:100% !important; height:100% !important; margin:0 !important; padding:0 !important;}
          table[align=center]{margin:0 auto !important;}
          @media only screen and (max-width: 480px){.headerImage{height:auto !important; max-width:100% !important;}}
          @media only screen and (max-width: 480px){.emailContent{margin-top:15px !important;}}
          @media only screen and (max-width: 480px){td.emailBody,td.emailFooter{text-align:left !important;}}
          @media only screen and (max-width: 480px){.ctaButton{max-width:250px !important;width:200px !important;}}
        </style>
      </head>
      <body width="100%" leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0" bgcolor="#eeeeee">
        <center>
          <table border="0" cellpadding="0" cellspacing="0" width="600" id="bodyTable">
            <tbody>
              <tr>
                <td align="center">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="emailContainer" style="max-width:550px;">
                    <!-- Header -->
                    <tbody>
                      <tr>
                        <td align="center" valign="top">
                          <img src="" alt="Bikbox" width="100%" style="display: block;mso-margin-top-alt:0px; mso-margin-bottom-alt:0px; mso-padding-alt: 0px 0px 0px 0px;" border="0" class="headerImage" />
                        </td>
                      </tr>
                      <!-- Content -->
                      <tr>
                        <td bgcolor="#00205B" style="padding-bottom:30px;">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" class="emailContentContainer" bgcolor="#00205B">
                            <tbody>
                              <tr>
                                <td align="center" valign="top" width="100%">
                                  <table bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:30px;max-width:510px;border-top:5px solid #EB3300;" class="emailContent">
                                    <!-- Body Content -->
                                    <tbody>
                                      <tr>
                                        <td style="font-family:'Nunito', sans-serif; font-weight:400;line-height:28px;font-size:22px;padding:30px 30px 15px;text-align:left;" class="emailBody">Password Reset Request</td>
                                      </tr>
                                      <tr>
                                        <td bgcolor="#ffffff" style="font-family:'Nunito', sans-serif; font-size:12px; padding:10px 30px; text-align:left;" align="center" class="emailBody">Hello ${user.firstname},</td>
                                      </tr>
                                      <tr>
                                        <td bgcolor="#ffffff" style="font-family:'Nunito', sans-serif; font-size:12px; padding:10px 10px 20px 30px;text-align:left;" align="center" class="emailBody">We heard you need a password reset. Click the link below and you'll be redirected to a secure site from which you can set a new password:</td>
                                      </tr>
                                      <tr>
                                        <td width="100%" bgcolor="#ffffff" style="font-family:'Nunito', sans-serif; font-size:12px;padding:10px 0 30px 0;text-align:center;" align="center" class="emailBody">
                                          <table width="60%" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;" align="center">
                                            <tbody>
                                              <tr>
                                                <td align="center" bgcolor="#FE5000" width="10%" style="border-radius:5px;"> <a href="${url}" style="padding:10px; width:300px; display:block; text-decoration:none; border:1px solid #FE5000; text-align:center; font-weight:bold; font-size:14px; font-family:'Nunito', sans-serif; color:#fff; background:#FE5000; border-radius:5px; line-height:17px;" class="ctaButton"> Reset My Password </a> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                        <!-- End of .emailBody -->
                                      </tr>
                                      <tr>
                                        <td bgcolor="#ffffff" style="font-family:'Nunito', sans-serif;font-size:12px;padding:0px 30px;text-align:left;" align="center" class="emailBody"> If you need additional assistance, or you did not make this change, please contact <a href="mailto:help@bikbox.com" style="font-family:Nunito, sans-serif; color:#FE5000; text-decoration:none;" >help@bikbox.com</a> and we'll forget this ever happened. <br /> <br /> </td>
                                      </tr>
                                      <tr>
                                        <td bgcolor="#ffffff" style="font-family:'Nunito', sans-serif;font-size:12px;padding:0px 0px 20px 30px;text-align:left;" align="center" class="emailBody"> Bikbox Team </td>
                                      </tr>
                                      <!-- End of .emailBody -->
                                      <tr>
                                        <td>
                                          <table bgcolor="#B4AA98" border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <!-- Footer -->
                                            <tbody>
                                              <tr>
                                                <td style="font-family:'Montserrat', sans-serif; font-size:10px; padding:25px 30px 5px 30px;" class="emailFooter"> &copy;${new Date().getFullYear()} Neptunes SAS, All Rights Reserved. </td>
                                              </tr>

                                            </tbody>
                                          </table> </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <!-- End of .emailContent --> </td>
                              </tr>
                            </tbody>
                          </table>
                          <!-- End of .emailContentContainer --> </td>
                      </tr>
                    </tbody>
                  </table>
                  <!-- End of emailContainer --> </td>
              </tr>
            </tbody>
          </table>
          <!-- End of #bodyTable -->
        </center>
      </body>
    </html>`
)};

export default editmailcontent;
