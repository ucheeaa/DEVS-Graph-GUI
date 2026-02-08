#include "cadmium/simulation/root_coordinator.hpp"
#include <limits>
#include "include/counter_system.hpp"

#ifndef NO_LOGGING
	#include "cadmium/simulation/logger/stdout.hpp"
	#include "cadmium/simulation/logger/csv.hpp"
#endif

using namespace cadmium;

extern "C" {

	 int main() {
		std::shared_ptr<counter_system> model = std::make_shared<counter_system>("counter_system");

		auto rootCoordinator = cadmium::RootCoordinator(model);

		#ifndef NO_LOGGING
			rootCoordinator.setLogger<cadmium::STDOUTLogger>(";");
			//rootCoordinator.setLogger<cadmium::CSVLogger>("logfile.csv", ";");
		#endif

		rootCoordinator.start();

		rootCoordinator.simulate(30);

		rootCoordinator.stop();

		return 0;
	}
}