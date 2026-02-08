#ifndef GENERATOR_BOOL_HPP
#define GENERATOR_BOOL_HPP

#include <iostream>
#include "cadmium/modeling/devs/atomic.hpp"

using namespace cadmium;

struct generator_boolState {
	double sigma;
	bool nextBool;

	explicit generator_boolState():  sigma(13.0),  nextBool(false) {
	}
};

#ifndef NO_LOGGING
	std::ostream& operator<<(std::ostream &out, const generator_boolState& state) {
		out << "{sigma: " << state.sigma << ", nextBool: " << state.nextBool << "}";
		return out;
	}
#endif

class generator_bool : public Atomic<generator_boolState> {
	public:
	//input ports

	//output ports
	Port<bool> bool_out;

	generator_bool(const std::string id) : Atomic<generator_boolState>(id, generator_boolState()) {
		//input ports

		//output ports
		bool_out = addOutPort<bool>("bool_out");
	}

	void internalTransition(generator_boolState& state) const override {
		state.nextBool = !state.nextBool;
	}

	void externalTransition(generator_boolState& state, double e) const override {
		// Not implemented
	}

	void output(const generator_boolState& state) const override {
		bool_out->addMessage(state.nextBool);
	}

	[[nodiscard]] double timeAdvance(const generator_boolState& state) const override {
		return state.sigma;
	}

};

#endif