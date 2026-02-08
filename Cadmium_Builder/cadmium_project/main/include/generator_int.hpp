#ifndef GENERATOR_INT_HPP
#define GENERATOR_INT_HPP

#include <iostream>
#include "cadmium/modeling/devs/atomic.hpp"

using namespace cadmium;

struct generator_intState {
	double sigma;
	int nextInt;

	explicit generator_intState():  sigma(3.0),  nextInt(1) {
	}
};

#ifndef NO_LOGGING
	std::ostream& operator<<(std::ostream &out, const generator_intState& state) {
		out << "{sigma: " << state.sigma << ", nextInt: " << state.nextInt << "}";
		return out;
	}
#endif

class generator_int : public Atomic<generator_intState> {
	public:
	//input ports

	//output ports
	Port<int> int_out;

	generator_int(const std::string id) : Atomic<generator_intState>(id, generator_intState()) {
		//input ports

		//output ports
		int_out = addOutPort<int>("int_out");
	}

	void internalTransition(generator_intState& state) const override {
		state.nextInt = rand() % 5 + 1;
	}

	void externalTransition(generator_intState& state, double e) const override {
		// Not implemented
	}

	void output(const generator_intState& state) const override {
		int_out->addMessage(state.nextInt);
	}

	[[nodiscard]] double timeAdvance(const generator_intState& state) const override {
		return state.sigma;
	}

};

#endif