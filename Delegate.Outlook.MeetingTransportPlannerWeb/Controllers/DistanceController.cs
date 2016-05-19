using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace Delegate.Outlook.MeetingTransportPlannerWeb.Controllers
{
    public class DistanceController : ApiController
    {
        public async Task<IHttpActionResult> Get(string origin, string destination)
        {
            var apikey = System.Configuration.ConfigurationManager.AppSettings["GoogleApiKey"];
            var s = $"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin}&destinations={destination}&key={apikey}"; 

            var client = new HttpClient();
            var res = await client.GetStringAsync(s);
            var response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(res, Encoding.UTF8, "application/json");
            return ResponseMessage(response);
        }
    }
}
