#ifndef INTEGER_GENERATOR_HPP
#define INTEGER_GENERATOR_HPP

#include <iostream>
#include "cadmium/modeling/devs/atomic.hpp"

using namespace cadmium;

struct integer_generatorState {
	double sigma;
	int nextInt;

	explicit integer_generatorState():  sigma(3.0),  nextInt(1) {
	}
};

#ifndef NO_LOGGING
	std::ostream& operator<<(std::ostream &out, const integer_generatorState& state) {
		out << "{sigma: " << state.sigma << ", nextInt: " << state.nextInt << "}";
		return out;
	}
#endif

class integer_generator : public Atomic<integer_generatorState> {
	public:
	//input ports

	//output ports
	Port<int> int_out;

	integer_generator(const std::string id) : Atomic<integer_generatorState>(id, integer_generatorState()) {
		//input ports

		//output ports
		int_out = addOutPort<int>("int_out");
	}

	void internalTransition(integer_generatorState& state) const override {
		state.nextInt = rand() % 5 + 1;
	}

	void externalTransition(integer_generatorState& state, double e) const override {
		// Not implemented
	}

	void output(const integer_generatorState& state) const override {
		int_out->addMessage(state.nextInt);
	}

	[[nodiscard]] double timeAdvance(const integer_generatorState& state) const override {
		return state.sigma;
	}

};

#endif