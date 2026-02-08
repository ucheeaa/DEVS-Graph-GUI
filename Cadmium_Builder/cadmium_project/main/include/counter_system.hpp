#ifndef COUNTER_SYSTEM_HPP
#define COUNTER_SYSTEM_HPP

#include "cadmium/modeling/devs/coupled.hpp"
#include "Counter.hpp"
#include "Integer_Generator.hpp"
#include "Boolean_Generator.hpp"

using namespace cadmium;

struct counter_system : public Coupled {

	counter_system(const std::string& id) : Coupled(id) {
		auto Counter_Model = addComponent<Counter>("Counter_Model");
		auto Increment_Generator = addComponent<Integer_Generator>("Increment_Generator");
		auto Direction_Generator = addComponent<Boolean_Generator>("Direction_Generator");

		addCoupling(Increment_Generator->int_out, Counter_Model->increment_in);
		addCoupling(Direction_Generator->bool_out, Counter_Model->direction_in);
	}
};

#endif